import type { TrendSummary } from "../types/analysis";

export function OverviewSection({ summary }: { summary: TrendSummary }) {
  return (
    <section className="overview section-shell" id="discover">
      <div className="section-heading">
        <div>
          <p className="eyebrow">01 / The study</p>
          <h2>Two regions. One shared record.</h2>
        </div>
        <p className="section-note">A consistent NASA POWER record, shaped into an honest starting point for exploration.</p>
      </div>
      <div className="region-grid">
        {(["Jazan", "Riyadh"] as const).map((region) => (
          <article className="region-card" key={region}>
            <div className={`region-marker ${region.toLowerCase()}`} />
            <div className="region-card-top"><span>Saudi Arabia</span><span>{region === "Jazan" ? "01" : "02"}</span></div>
            <h3>{region}</h3>
            <p>{summary.metadata[region].coordinates[1].toFixed(2)}° N <span>·</span> {summary.metadata[region].coordinates[0].toFixed(2)}° E</p>
            <div className="region-meta"><span><strong>26</strong> years</span><span><strong>2</strong> indicators</span><span><strong>MERRA-2</strong> source</span></div>
          </article>
        ))}
      </div>
      <div className="indicator-strip">
        <span className="indicator-label">Observing</span>
        <span className="indicator-pill"><b className="dot warm" /> Temperature <small>T2M / °C</small></span>
        <span className="indicator-pill"><b className="dot cool" /> Precipitation <small>PRECTOTCORR / mm</small></span>
        <span className="indicator-period">2000 <i>—</i> 2025</span>
      </div>
    </section>
  );
}
