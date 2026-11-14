import { useState } from "react";
import type { AnnualRecord, Metric, TrendSummary } from "../types/analysis";
import { TrendChart } from "../components/TrendChart";

export function ExploreSection({ records, summary }: { records: AnnualRecord[]; summary: TrendSummary }) {
  const [metric, setMetric] = useState<Metric>("temperature");
  const unit = metric === "temperature" ? "°C" : "mm";
  const label = metric === "temperature" ? "Annual mean temperature" : "Annual total precipitation";
  return (
    <section className="explore section-shell" id="explore">
      <div className="section-heading">
        <div><p className="eyebrow">02 / Explore the record</p><h2>See the signal, year by year.</h2></div>
        <div className="metric-switcher" role="group" aria-label="Select indicator">
          <button className={metric === "temperature" ? "active" : ""} onClick={() => setMetric("temperature")}>Temperature</button>
          <button className={metric === "precipitation" ? "active" : ""} onClick={() => setMetric("precipitation")}>Precipitation</button>
        </div>
      </div>
      <div className="chart-panel">
        <div className="chart-heading"><div><span className="chart-kicker">{label}</span><strong>{unit}</strong></div><span className="chart-source">Annual processed indicators · 26 observations</span></div>
        <TrendChart records={records} metric={metric} />
      </div>
      <div className="trend-cards" id="compare">
        {(["Jazan", "Riyadh"] as const).map((region) => {
          const result = summary.trends[`${region.toLowerCase()}_${metric}`];
          return <article className="trend-card" key={region}><span>{region}</span><strong>{result.sens_slope_per_year > 0 ? "+" : ""}{result.sens_slope_per_year.toFixed(3)} <small>{unit}/yr</small></strong><p><i className={result.statistically_significant ? "significant" : ""} /> {result.statistically_significant ? "Significant trend" : "Not significant at α = 0.05"}</p></article>;
        })}
      </div>
    </section>
  );
}
