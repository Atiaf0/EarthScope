import { useEffect, useState } from "react";
import { Navigation } from "./components/Navigation";
import { loadAnalysisData } from "./data/loadAnalysisData";
import { ExploreSection } from "./sections/ExploreSection";
import { HeroSection } from "./sections/HeroSection";
import { MethodologySection } from "./sections/MethodologySection";
import { OverviewSection } from "./sections/OverviewSection";
import type { AnnualRecord, TrendSummary } from "./types/analysis";
import "./styles/global.css";

export default function App() {
  const [data, setData] = useState<{ annualRecords: AnnualRecord[]; summary: TrendSummary }>();
  const [error, setError] = useState<string>();
  useEffect(() => {
    loadAnalysisData().then(setData).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load EarthScope data."));
  }, []);
  return (
    <>
      <Navigation />
      {error ? <main className="state-message"><p className="eyebrow">Data unavailable</p><h1>EarthScope could not load its processed record.</h1><p>{error}</p></main> : !data ? <main className="state-message"><span className="loader" /><p>Loading the EarthScope record…</p></main> : <main><HeroSection /><OverviewSection summary={data.summary} /><ExploreSection records={data.annualRecords} summary={data.summary} /><MethodologySection summary={data.summary} /></main>}
      <footer><span>EarthScope / INSIGHT · Team 19</span><span>NASA Space Apps Challenge 2026</span></footer>
    </>
  );
}
