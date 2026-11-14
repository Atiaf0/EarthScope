export function HeroSection() {
  return (
    <section className="hero section-shell" id="overview">
      <div className="hero-copy">
        <p className="eyebrow"><span /> NASA Space Apps Challenge 2026</p>
        <h1>Read the pulse<br /><em>of a changing place.</em></h1>
        <p className="hero-lede">
          EarthScope turns two decades of NASA Earth data into a clearer view
          of environmental change across Jazan and Riyadh.
        </p>
        <a className="primary-button" href="#explore">Start exploring <span>↗</span></a>
      </div>
      <div className="hero-orbit" aria-hidden="true">
        <div className="orbit-ring orbit-ring-one" />
        <div className="orbit-ring orbit-ring-two" />
        <div className="planet"><div className="planet-glow" /></div>
        <span className="orbit-label label-top">16.88° N / 42.55° E</span>
        <span className="orbit-label label-bottom">24.71° N / 46.68° E</span>
      </div>
    </section>
  );
}
