import { Wordmark } from "./Wordmark";

const COLUMNS = [
  { title: "Product", links: ["How it works", "Scenarios", "Pricing", "Changelog"] },
  { title: "Roles", links: ["On-call engineers", "Incident commanders", "Support leads", "SRE / Ops"] },
  { title: "Company", links: ["About", "Careers", "Security", "Contact"] },
];

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-6 py-section md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="flex flex-col gap-3">
          <Wordmark />
          <p className="max-w-xs text-body text-secondary">
            Voice-first crisis drills that build the muscle memory for staying calm when it counts.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title} className="flex flex-col gap-3">
            <span className="text-body-strong text-primary">{col.title}</span>
            <ul className="flex flex-col gap-2">
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#" className="text-body text-secondary transition hover:text-primary">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-6 text-label text-muted">
          <span>© 2026 Redline Labs</span>
          <span className="font-mono">redline.training</span>
        </div>
      </div>
    </footer>
  );
}
