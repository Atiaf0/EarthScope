import type { Metric, TrendSummary } from "../types/analysis";

export function CompareSection({ summary }: { summary: TrendSummary }) {
  const comparisons: { key: Metric; label: string; unit: string; value: number }[] = [
    { key: "temperature", label: "Temperature", unit: "°C/year", value: summary.regional_comparison.temperature_sen_slope_difference_riyadh_minus_jazan },
    { key: "precipitation", label: "Precipitation", unit: "mm/year", value: summary.regional_comparison.precipitation_sen_slope_difference_riyadh_minus_jazan },
  ];
  return (
    <section className="compare section-shell" id="compare-insights">
      <div className="section-heading">
        <div><p className="eyebrow">04 / Compare</p><h2>Different signals. Shared context.</h2></div>
        <p className="section-note">Regional slope differences summarize the two records. They are descriptive and have not been formally tested.</p>
      </div>
      <div className="comparison-panel">
        {comparisons.map((comparison) => (
          <article className="comparison-row" key={comparison.key}>
            <div><span>{comparison.label}</span><small>Riyadh minus Jazan · Sen&apos;s slope</small></div>
            <strong className={comparison.value >= 0 ? "warm-value" : "cool-value"}>{comparison.value >= 0 ? "+" : ""}{comparison.value.toFixed(6)} <small>{comparison.unit}</small></strong>
          </article>
        ))}
        <p className="comparison-disclaimer"><i /> Descriptive comparison only — separate regional p-values do not test whether the regional slopes differ.</p>
      </div>
    </section>
  );
}
