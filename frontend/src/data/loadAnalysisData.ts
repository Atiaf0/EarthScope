import type { AnnualRecord, Region, TrendSummary } from "../types/analysis";

const annualDataUrl = "/data/annual_environmental_indicators_2000_2025.csv";
const summaryUrl = "/data/trend_summary_2000_2025.json";

function parseCsvRow(line: string): string[] {
  return line.split(",").map((value) => value.trim());
}

function parseAnnualCsv(csv: string): AnnualRecord[] {
  const lines = csv.trim().split(/\r?\n/);
  const headers = parseCsvRow(lines.shift() ?? "");
  const expectedHeaders = [
    "region",
    "year",
    "annual_mean_temperature_degC",
    "annual_total_precipitation_mm",
  ];
  if (headers.join("|") !== expectedHeaders.join("|")) {
    throw new Error("The annual data CSV has an unexpected schema.");
  }

  return lines.map((line, index) => {
    const [region, year, temperature, precipitation] = parseCsvRow(line);
    if (region !== "Jazan" && region !== "Riyadh") {
      throw new Error(`Unknown region in annual data row ${index + 2}.`);
    }
    const parsed = {
      region: region as Region,
      year: Number(year),
      annualMeanTemperatureDegC: Number(temperature),
      annualTotalPrecipitationMm: Number(precipitation),
    };
    if (Object.values(parsed).some((value) => typeof value === "number" && !Number.isFinite(value))) {
      throw new Error(`Invalid numeric value in annual data row ${index + 2}.`);
    }
    return parsed;
  });
}

function validateSummary(summary: TrendSummary): TrendSummary {
  if (
    summary.period.start_year !== 2000 ||
    summary.period.end_year !== 2025 ||
    !summary.validation.all_annual_values_present ||
    !summary.validation.csv_exact_year_sequence
  ) {
    throw new Error("The statistical summary failed its integrity checks.");
  }
  return summary;
}

export async function loadAnalysisData(): Promise<{
  annualRecords: AnnualRecord[];
  summary: TrendSummary;
}> {
  const [annualResponse, summaryResponse] = await Promise.all([
    fetch(annualDataUrl),
    fetch(summaryUrl),
  ]);
  if (!annualResponse.ok || !summaryResponse.ok) {
    throw new Error("Processed EarthScope data could not be loaded.");
  }
  const [annualCsv, summaryJson] = await Promise.all([
    annualResponse.text(),
    summaryResponse.json(),
  ]);
  const annualRecords = parseAnnualCsv(annualCsv);
  if (annualRecords.length !== 52) {
    throw new Error("The annual data does not contain 52 expected records.");
  }
  return { annualRecords, summary: validateSummary(summaryJson as TrendSummary) };
}
