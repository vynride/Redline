import Link from "next/link";
import { buttonStyles } from "@/components/ui";
import { Wordmark } from "./Wordmark";

const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#archetypes", label: "Scenarios" },
  { href: "#value", label: "Why Redline" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-base/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
        <Wordmark />
        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-body-strong text-secondary transition hover:text-primary">
              {l.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className={buttonStyles("ghost", "hidden sm:inline-flex")}>
            Log in
          </Link>
          <Link href="/login" className={buttonStyles("primary")}>
            Start a drill
          </Link>
        </div>
      </nav>
    </header>
  );
}
