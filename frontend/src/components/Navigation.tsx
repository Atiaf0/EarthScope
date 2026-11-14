import { BrandMark } from "./BrandMark";

const links = [
  ["Overview", "overview"],
  ["Explore", "explore"],
  ["Detect", "detect"],
  ["Compare", "compare-insights"],
  ["Understand", "methodology"],
];

export function Navigation() {
  return (
    <header className="site-header">
      <BrandMark />
      <nav aria-label="Primary navigation">
        {links.map(([label, target]) => (
          <a key={target} href={`#${target}`}>
            {label}
          </a>
        ))}
      </nav>
      <span className="header-status"><i /> NASA POWER / 2000–2025</span>
    </header>
  );
}
