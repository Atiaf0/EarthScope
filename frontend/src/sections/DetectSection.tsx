import type { Metric, Region, TrendResult, TrendSummary } from "../types/analysis";

const regions: Region[] = ["Jazan", "Riyadh"];
const metrics: { key: Metric; label: string; unit: string }[] = [
  { key: "temperature", label: "Temperature", unit: "°C/year" },
  { key: "precipitation", label: "Precipitation", unit: "mm/year" },
];

function ResultCard({
  region,
  metric,
  unit,
  original,
  adjusted,
}: {
  region: Region;
  metric: string;
  unit: string;
  original: TrendResult;
  adjusted: TrendResult;
}) {
  const robust = original.statistically_significant === adjusted.statistically_significant;
  return (
    <article className="detect-card">
      <div className="detect-card-heading">
        <span>{region}</span>
        <small>{metric}</small>
      </div>
      <div className="detect-stat">
        <strong>{original.sens_slope_per_year > 0 ? "+" : ""}{original.sens_slope_per_year.toFixed(6)}</strong>
        <span>{unit} Original Sen&apos;s slope</span>
      </div>
      <div className="detect-row"><span>Original Mann–Kendall</span><strong>p = {original.p_value.toFixed(6)}</strong></div>
      <div className="detect-row"><span>Original conclusion</span><strong className={original.statistically_significant ? "positive" : ""}>{original.statistically_significant ? "Significant" : "Not significant"}</strong></div>
      <div className="detect-divider" />
      <div className="detect-row sensitivity"><span>Adjusted Sen&apos;s slope</span><strong>{adjusted.sens_slope_per_year > 0 ? "+" : ""}{adjusted.sens_slope_per_year.toFixed(6)} {unit}</strong></div>
      <div className="detect-row sensitivity"><span>Yue–Pilon sensitivity</span><strong>p = {adjusted.p_value.toFixed(6)}</strong></div>
      <div className="detect-row sensitivity"><span>Sensitivity conclusion</span><strong className={adjusted.statistically_significant ? "positive" : ""}>{adjusted.statistically_significant ? "Significant" : "Not significant"}</strong></div>
      <p className="detect-sensitivity-note">Adjusted slope and inference are reported only as a Yue–Pilon sensitivity result.</p>
      <p className={`detect-verdict ${robust ? "stable" : "changed"}`}>
        <i /> {robust ? "Conclusion is consistent across both results." : "Sensitivity changes the significance conclusion."}
      </p>
    </article>
  );
}

export function DetectSection({ summary }: { summary: TrendSummary }) {
  return (
    <section className="detect section-shell" id="detect">
      <div className="section-heading">
        <div><p className="eyebrow">03 / Trend detective</p><h2>Follow the evidence.</h2></div>
        <p className="section-note">The original test and the autocorrelation sensitivity are shown side by side so significance is never separated from context.</p>
      </div>
      <div className="detect-grid">
        {regions.flatMap((region) => metrics.map(({ key, label, unit }) => (
          <ResultCard
            key={`${region}-${key}`}
            region={region}
            metric={label}
            unit={unit}
            original={summary.trends[`${region.toLowerCase()}_${key}`]}
            adjusted={summary.adjusted_trends[`${region.toLowerCase()}_${key}`]}
          />
        )))}
      </div>
      <div className="detect-footnote"><span><i className="legend-dot original" /> Original Mann–Kendall result</span><span><i className="legend-dot sensitivity" /> Yue–Pilon sensitivity result</span><span>α = 0.05 · 26 annual observations</span></div>
    </section>
  );
}
