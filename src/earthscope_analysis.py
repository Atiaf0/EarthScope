"""Reproducible annual trend analysis for NASA POWER monthly data."""

from __future__ import annotations

import argparse
import calendar
import csv
import hashlib
import json
import math
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from statistics import median
from typing import Any


START_YEAR = 2000
END_YEAR = 2025
ALPHA = 0.05
TEMPERATURE_UNIT = "degC"
PRECIPITATION_UNIT = "mm"


@dataclass(frozen=True)
class AnnualRecord:
    year: int
    temperature_c: float
    precipitation_mm: float


@dataclass(frozen=True)
class TrendResult:
    indicator: str
    unit: str
    n: int
    kendall_s: int
    kendall_variance: float
    kendall_z: float
    p_value: float
    sen_slope: float
    trend_direction: str
    statistically_significant: bool


def _expected_months() -> list[str]:
    return [
        f"{year:04d}{month:02d}"
        for year in range(START_YEAR, END_YEAR + 1)
        for month in range(1, 13)
    ]


def load_monthly_data(path: Path) -> tuple[dict[str, Any], dict[str, dict[str, float]]]:
    """Load one raw response and return only its 12-month records per year."""
    with path.open(encoding="utf-8") as file:
        payload = json.load(file)

    parameters = payload.get("properties", {}).get("parameter", {})
    if "T2M" not in parameters or "PRECTOTCORR" not in parameters:
        raise ValueError(f"{path} does not contain both requested parameters")

    expected = set(_expected_months())
    t2m = parameters["T2M"]
    precipitation = parameters["PRECTOTCORR"]
    expected_annual_keys = {f"{year:04d}13" for year in range(START_YEAR, END_YEAR + 1)}
    for parameter_name, values in (("T2M", t2m), ("PRECTOTCORR", precipitation)):
        annual_keys = {key for key in values if key.endswith("13")}
        if annual_keys != expected_annual_keys:
            raise ValueError(f"{path} has incomplete {parameter_name} annual summary keys")
    actual_months = set(t2m) & set(precipitation) & expected
    if actual_months != expected:
        missing = sorted(expected - actual_months)
        raise ValueError(f"{path} has incomplete monthly coverage; missing {missing}")

    monthly: dict[str, dict[str, float]] = {}
    for key in sorted(expected):
        temperature = t2m[key]
        rainfall = precipitation[key]
        if (
            temperature is None
            or rainfall is None
            or temperature == -999
            or rainfall == -999
            or not math.isfinite(float(temperature))
            or not math.isfinite(float(rainfall))
        ):
            raise ValueError(f"{path} contains a missing or fill value at {key}")
        monthly[key] = {"T2M": float(temperature), "PRECTOTCORR": float(rainfall)}
    return payload, monthly


def annualize(monthly: dict[str, dict[str, float]]) -> list[AnnualRecord]:
    """Convert monthly rates to annual indicators using actual month lengths."""
    records: list[AnnualRecord] = []
    for year in range(START_YEAR, END_YEAR + 1):
        weighted_temperature = 0.0
        precipitation_total = 0.0
        days_in_year = 0
        for month in range(1, 13):
            values = monthly[f"{year:04d}{month:02d}"]
            days = calendar.monthrange(year, month)[1]
            weighted_temperature += values["T2M"] * days
            precipitation_total += values["PRECTOTCORR"] * days
            days_in_year += days
        records.append(
            AnnualRecord(
                year=year,
                temperature_c=weighted_temperature / days_in_year,
                precipitation_mm=precipitation_total,
            )
        )
    return records


def _normal_two_sided_p_value(z: float) -> float:
    return math.erfc(abs(z) / math.sqrt(2.0))


def _mann_kendall(values: list[float]) -> tuple[int, float, float, float]:
    s = sum(
        1 if values[j] > values[i] else -1 if values[j] < values[i] else 0
        for i in range(len(values))
        for j in range(i + 1, len(values))
    )
    ties: dict[float, int] = {}
    for value in values:
        ties[value] = ties.get(value, 0) + 1
    tie_term = sum(count * (count - 1) * (2 * count + 5) for count in ties.values())
    n = len(values)
    variance = (n * (n - 1) * (2 * n + 5) - tie_term) / 18.0
    if variance == 0:
        z = 0.0
    elif s > 0:
        z = (s - 1) / math.sqrt(variance)
    elif s < 0:
        z = (s + 1) / math.sqrt(variance)
    else:
        z = 0.0
    return s, variance, z, _normal_two_sided_p_value(z)


def _sen_slope(years: list[int], values: list[float]) -> float:
    slopes = [
        (values[j] - values[i]) / (years[j] - years[i])
        for i in range(len(values))
        for j in range(i + 1, len(values))
    ]
    return float(median(slopes))


def lag1_autocorrelation(values: list[float]) -> float | None:
    """Return Pearson lag-1 autocorrelation, or None for a constant series."""
    if len(values) < 3:
        raise ValueError("Lag-1 autocorrelation requires at least three values")
    previous = values[:-1]
    current = values[1:]
    previous_mean = sum(previous) / len(previous)
    current_mean = sum(current) / len(current)
    numerator = sum(
        (left - previous_mean) * (right - current_mean)
        for left, right in zip(previous, current)
    )
    denominator = math.sqrt(
        sum((value - previous_mean) ** 2 for value in previous)
        * sum((value - current_mean) ** 2 for value in current)
    )
    return None if denominator == 0 else numerator / denominator


def trend_free_prewhiten(years: list[int], values: list[float]) -> tuple[list[float], float]:
    """Apply Yue-Pilon trend-free pre-whitening and restore the Sen trend."""
    slope = _sen_slope(years, values)
    detrended = [value - slope * year for year, value in zip(years, values)]
    autocorrelation = lag1_autocorrelation(detrended)
    if autocorrelation is None:
        return values[:], 0.0
    prewhitened = [detrended[0]]
    for index in range(1, len(detrended)):
        prewhitened.append(detrended[index] - autocorrelation * detrended[index - 1])
    return [
        value + slope * year
        for year, value in zip(years, prewhitened)
    ], autocorrelation


def analyze_trend(
    indicator: str, unit: str, years: list[int], values: list[float]
) -> TrendResult:
    if len(years) != len(values) or len(values) < 2:
        raise ValueError("Trend analysis requires matching sequences with at least two values")
    s, variance, z, p_value = _mann_kendall(values)
    slope = _sen_slope(years, values)
    direction = "increasing" if slope > 0 else "decreasing" if slope < 0 else "no trend"
    return TrendResult(
        indicator=indicator,
        unit=unit,
        n=len(values),
        kendall_s=s,
        kendall_variance=variance,
        kendall_z=z,
        p_value=p_value,
        sen_slope=slope,
        trend_direction=direction,
        statistically_significant=p_value < ALPHA,
    )


def _result_dict(result: TrendResult) -> dict[str, Any]:
    return {
        "indicator": result.indicator,
        "unit": result.unit,
        "observations": result.n,
        "mann_kendall_s": result.kendall_s,
        "mann_kendall_variance": result.kendall_variance,
        "mann_kendall_z": result.kendall_z,
        "p_value": result.p_value,
        "sens_slope_per_year": result.sen_slope,
        "trend_direction": result.trend_direction,
        "alpha": ALPHA,
        "statistically_significant": result.statistically_significant,
    }


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as file:
        for chunk in iter(lambda: file.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def run_analysis(root: Path) -> dict[str, Any]:
    raw_dir = root / "data" / "raw"
    processed_dir = root / "data" / "processed"
    processed_dir.mkdir(parents=True, exist_ok=True)
    sources = {
        "Jazan": raw_dir / "nasa_power_jazan_monthly_2000_2025.json",
        "Riyadh": raw_dir / "nasa_power_riyadh_monthly_2000_2025.json",
    }
    original_hashes = {region: _sha256(path) for region, path in sources.items()}
    annual_data: dict[str, list[AnnualRecord]] = {}
    metadata: dict[str, Any] = {}
    for region, path in sources.items():
        payload, monthly = load_monthly_data(path)
        if payload["parameters"]["T2M"]["units"] != "C":
            raise ValueError(f"{path} has unexpected T2M units")
        if payload["parameters"]["PRECTOTCORR"]["units"] != "mm/day":
            raise ValueError(f"{path} has unexpected PRECTOTCORR units")
        annual_data[region] = annualize(monthly)
        metadata[region] = {
            "source": payload["header"]["sources"],
            "coordinates": payload["geometry"]["coordinates"],
            "units": {
                "T2M": payload["parameters"]["T2M"]["units"],
                "PRECTOTCORR": payload["parameters"]["PRECTOTCORR"]["units"],
            },
            "monthly_records": len(monthly),
            "annual_summary_keys_excluded": len(
                [key for key in payload["properties"]["parameter"]["T2M"] if key.endswith("13")]
            ),
        }

    csv_path = processed_dir / "annual_environmental_indicators_2000_2025.csv"
    with csv_path.open("w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow(["region", "year", "annual_mean_temperature_degC", "annual_total_precipitation_mm"])
        for region, records in annual_data.items():
            for record in records:
                writer.writerow([region, record.year, f"{record.temperature_c:.12f}", f"{record.precipitation_mm:.12f}"])

    trends: dict[str, dict[str, Any]] = {}
    adjusted_trends: dict[str, dict[str, Any]] = {}
    autocorrelation: dict[str, dict[str, Any]] = {}
    for region, records in annual_data.items():
        years = [record.year for record in records]
        series = {
            "temperature": ("annual_mean_temperature", TEMPERATURE_UNIT, [r.temperature_c for r in records]),
            "precipitation": ("annual_total_precipitation", PRECIPITATION_UNIT, [r.precipitation_mm for r in records]),
        }
        for name, (indicator, unit, values) in series.items():
            key = f"{region.lower()}_{name}"
            trends[key] = _result_dict(analyze_trend(indicator, unit, years, values))
            adjusted_values, detrended_r1 = trend_free_prewhiten(years, values)
            adjusted_trends[key] = _result_dict(analyze_trend(indicator, unit, years, adjusted_values))
            autocorrelation[key] = {
                "lag_1": lag1_autocorrelation(values),
                "detrended_lag_1_used_for_tfpw": detrended_r1,
                "adjustment": "Yue-Pilon trend-free pre-whitening",
            }

    comparison = {
        "temperature_sen_slope_difference_riyadh_minus_jazan": (
            trends["riyadh_temperature"]["sens_slope_per_year"]
            - trends["jazan_temperature"]["sens_slope_per_year"]
        ),
        "precipitation_sen_slope_difference_riyadh_minus_jazan": (
            trends["riyadh_precipitation"]["sens_slope_per_year"]
            - trends["jazan_precipitation"]["sens_slope_per_year"]
        ),
        "interpretation": (
            "Slope differences are descriptive comparisons. Separate Mann-Kendall "
            "p-values do not test whether regional slopes differ significantly; no "
            "between-region significance test is claimed here."
        ),
    }
    validation = {
        "annual_observations_per_region": {region: len(records) for region, records in annual_data.items()},
        "all_annual_values_present": all(
            all(math.isfinite(value) for value in (record.temperature_c, record.precipitation_mm))
            for records in annual_data.values()
            for record in records
        ),
        "temperature_unit": TEMPERATURE_UNIT,
        "precipitation_unit": PRECIPITATION_UNIT,
        "raw_files_unchanged": all(_sha256(path) == original_hashes[region] for region, path in sources.items()),
    }
    expected_years = [str(year) for year in range(START_YEAR, END_YEAR + 1)]
    with csv_path.open(newline="", encoding="utf-8") as file:
        csv_rows = list(csv.DictReader(file))
    validation["csv_exact_year_sequence"] = all(
        [row["year"] for row in csv_rows if row["region"] == region] == expected_years
        for region in annual_data
    )
    summary = {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "period": {"start_year": START_YEAR, "end_year": END_YEAR},
        "methodology": {
            "temperature": "Calendar-day-weighted mean of monthly T2M values.",
            "precipitation": "Monthly PRECTOTCORR mm/day multiplied by actual calendar days, then summed.",
            "mann_kendall": "Two-sided normal-approximation Mann-Kendall test with tie correction and continuity correction.",
            "sen_slope": "Median of all pairwise annual slopes.",
            "significance": "alpha = 0.05; p-value below alpha is statistically significant.",
        },
        "metadata": metadata,
        "trends": trends,
        "autocorrelation": autocorrelation,
        "adjusted_trends": adjusted_trends,
        "regional_comparison": comparison,
        "validation": validation,
        "limitations": [
            "Trend-free pre-whitening is reported as a sensitivity adjustment; no formal autocorrelation hypothesis test is claimed.",
            "Regional slope differences are not assigned a significance test in this first version.",
            "The analysis describes trends and does not establish causation.",
        ],
    }
    summary_path = processed_dir / "trend_summary_2000_2025.json"
    summary_path.write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")
    return summary


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    summary = run_analysis(args.root)
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
