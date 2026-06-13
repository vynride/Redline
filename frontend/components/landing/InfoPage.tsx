import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export interface InfoSection {
  heading: string;
  body: string[];
}

/** Shared layout for the simple company/legal pages (About, Security, Privacy). */
export function InfoPage({
  eyebrow,
  title,
  updated,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  intro: string;
  sections: InfoSection[];
}) {
  return (
    <main className="min-h-screen bg-ink text-primary">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-label text-secondary transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Redline
        </Link>

        <header className="mt-8 border-b border-panel-line pb-8">
          <span className="font-mono text-[12px] uppercase tracking-[0.16em] text-violet-300">{eyebrow}</span>
          <h1 className="mt-2 text-[34px] font-semibold leading-tight text-white">{title}</h1>
          <p className="mt-2 text-label text-muted">Last updated {updated}</p>
          <p className="mt-5 text-body-lg leading-relaxed text-secondary">{intro}</p>
        </header>

        <div className="mt-10 flex flex-col gap-9">
          {sections.map((s) => (
            <section key={s.heading} className="flex flex-col gap-3">
              <h2 className="text-[19px] font-semibold text-white">{s.heading}</h2>
              {s.body.map((p, i) => (
                <p key={i} className="text-body leading-relaxed text-secondary">{p}</p>
              ))}
            </section>
          ))}
        </div>

        <footer className="mt-14 border-t border-panel-line pt-6 text-label text-muted">
          Questions? Reach us at{" "}
          <a href="mailto:vynride@gmail.com" className="text-secondary hover:text-white">vynride@gmail.com</a>.
        </footer>
      </div>
    </main>
  );
}
