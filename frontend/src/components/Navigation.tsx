import { BrandMark } from "./BrandMark";

const links = ["Overview", "Explore", "Compare", "Discover", "Methodology"];

export function Navigation() {
  return (
    <header className="site-header">
      <BrandMark />
      <nav aria-label="Primary navigation">
        {links.map((link) => (
          <a key={link} href={`#${link.toLowerCase()}`}>
            {link}
          </a>
        ))}
      </nav>
      <span className="header-status"><i /> NASA POWER / 2000–2025</span>
    </header>
  );
}
