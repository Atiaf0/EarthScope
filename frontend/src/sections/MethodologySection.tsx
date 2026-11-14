import type { TrendSummary } from "../types/analysis";

export function MethodologySection({ summary }: { summary: TrendSummary }) {
  return (
    <section className="methodology section-shell" id="methodology">
      <div className="section-heading"><div><p className="eyebrow">03 / Transparent by design</p><h2>Context before conclusions.</h2></div><p className="section-note">The interface presents processed results from the analysis pipeline. It does not recalculate or infer beyond the evidence.</p></div>
      <div className="method-grid">
        <article><span className="method-number">01</span><h3>Measured consistently</h3><p>NASA POWER monthly T2M and PRECTOTCORR data, processed into calendar-day-weighted annual indicators for 2000–2025.</p></article>
        <article><span className="method-number">02</span><h3>Tested carefully</h3><p>Mann–Kendall and Sen’s slope results are reported alongside a separate Yue–Pilon trend-free pre-whitening sensitivity analysis.</p></article>
        <article><span className="method-number">03</span><h3>Never overstated</h3><p>Regional slope differences remain descriptive. They are not presented as evidence of statistically significant differences.</p></article>
      </div>
      <div className="integrity-line"><span><i /> Analysis ready</span><span>{summary.validation.annual_observations_per_region.Jazan + summary.validation.annual_observations_per_region.Riyadh} annual records loaded</span><span>Generated {new Date(summary.generated_at_utc).toLocaleDateString("en-GB")}</span></div>
    </section>
  );
}
