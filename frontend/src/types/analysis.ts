export type Region = "Jazan" | "Riyadh";
export type Metric = "temperature" | "precipitation";

export interface AnnualRecord {
  region: Region;
  year: number;
  annualMeanTemperatureDegC: number;
  annualTotalPrecipitationMm: number;
}

export interface TrendResult {
  indicator: string;
  unit: string;
  observations: number;
  p_value: number;
  sens_slope_per_year: number;
  trend_direction: "increasing" | "decreasing" | "no trend";
  statistically_significant: boolean;
}

export interface TrendSummary {
  generated_at_utc: string;
  period: { start_year: number; end_year: number };
  metadata: Record<Region, {
    source: string[];
    coordinates: number[];
    units: { T2M: string; PRECTOTCORR: string };
    monthly_records: number;
    annual_summary_keys_excluded: number;
  }>;
  trends: Record<string, TrendResult>;
  adjusted_trends: Record<string, TrendResult>;
  autocorrelation: Record<string, {
    lag_1: number;
    detrended_lag_1_used_for_tfpw: number;
    adjustment: string;
  }>;
  regional_comparison: {
    temperature_sen_slope_difference_riyadh_minus_jazan: number;
    precipitation_sen_slope_difference_riyadh_minus_jazan: number;
    interpretation: string;
  };
  validation: {
    annual_observations_per_region: Record<Region, number>;
    all_annual_values_present: boolean;
    raw_files_unchanged: boolean;
    csv_exact_year_sequence: boolean;
  };
  limitations: string[];
}
