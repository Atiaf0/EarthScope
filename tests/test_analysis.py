import json
import tempfile
import unittest
from pathlib import Path

from src.earthscope_analysis import (
    _mann_kendall,
    _normal_two_sided_p_value,
    _sen_slope,
    annualize,
    lag1_autocorrelation,
    load_monthly_data,
    run_analysis,
)


ROOT = Path(__file__).resolve().parents[1]


class AnalysisTests(unittest.TestCase):
    def test_mann_kendall_increasing_series(self):
        s, variance, z, p_value = _mann_kendall([1.0, 2.0, 3.0, 4.0, 5.0])
        self.assertEqual(s, 10)
        self.assertGreater(z, 0)
        self.assertLess(p_value, 0.05)
        self.assertGreater(variance, 0)

    def test_mann_kendall_decreasing_series(self):
        s, variance, z, p_value = _mann_kendall([5.0, 4.0, 3.0, 2.0, 1.0])
        self.assertEqual(s, -10)
        self.assertLess(z, 0)
        self.assertLess(p_value, 0.05)
        self.assertGreater(variance, 0)

    def test_mann_kendall_constant_series(self):
        self.assertEqual(_mann_kendall([2.0, 2.0, 2.0, 2.0]), (0, 0.0, 0.0, 1.0))

    def test_tie_correction(self):
        s, variance, _, _ = _mann_kendall([1.0, 1.0, 2.0, 2.0])
        self.assertEqual(s, 4)
        self.assertEqual(variance, 6.666666666666667)

    def test_sens_slope_known_values(self):
        self.assertEqual(_sen_slope([2000, 2001, 2002], [1.0, 3.0, 5.0]), 2.0)

    def test_p_value_calculation(self):
        self.assertEqual(_normal_two_sided_p_value(0.0), 1.0)
        self.assertAlmostEqual(_normal_two_sided_p_value(1.959963984540054), 0.05, places=12)

    def test_lag_one_autocorrelation_constant_series(self):
        self.assertIsNone(lag1_autocorrelation([1.0, 1.0, 1.0]))

    def test_raw_files_have_312_months_and_26_annual_keys(self):
        for name in ("jazan", "riyadh"):
            path = ROOT / "data" / "raw" / f"nasa_power_{name}_monthly_2000_2025.json"
            payload, monthly = load_monthly_data(path)
            self.assertEqual(len(monthly), 312)
            for parameter in ("T2M", "PRECTOTCORR"):
                self.assertEqual(
                    len([key for key in payload["properties"]["parameter"][parameter] if key.endswith("13")]),
                    26,
                )

    def test_non_finite_monthly_values_are_rejected(self):
        source = ROOT / "data" / "raw" / "nasa_power_jazan_monthly_2000_2025.json"
        payload = json.loads(source.read_text())
        payload["properties"]["parameter"]["T2M"]["200001"] = float("nan")
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "invalid.json"
            path.write_text(json.dumps(payload))
            with self.assertRaises(ValueError):
                load_monthly_data(path)

    def test_leap_year_temperature_weighting_and_precipitation_conversion(self):
        monthly = {
            f"{year:04d}{month:02d}": {"T2M": 10.0, "PRECTOTCORR": 1.0}
            for year in range(2000, 2026)
            for month in range(1, 13)
        }
        record = annualize(monthly)[0]
        self.assertEqual(record.temperature_c, 10.0)
        self.assertEqual(record.precipitation_mm, 366.0)

    def test_run_analysis_outputs_valid_summary(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "data" / "raw").mkdir(parents=True)
            for name in ("jazan", "riyadh"):
                source = ROOT / "data" / "raw" / f"nasa_power_{name}_monthly_2000_2025.json"
                (root / "data" / "raw" / source.name).write_bytes(source.read_bytes())
            summary = run_analysis(root)
            self.assertEqual(summary["validation"]["annual_observations_per_region"], {"Jazan": 26, "Riyadh": 26})
            self.assertTrue(summary["validation"]["raw_files_unchanged"])
            self.assertTrue(summary["validation"]["csv_exact_year_sequence"])
            self.assertEqual(len(json.loads((root / "data" / "processed" / "trend_summary_2000_2025.json").read_text())["trends"]), 4)


if __name__ == "__main__":
    unittest.main()
