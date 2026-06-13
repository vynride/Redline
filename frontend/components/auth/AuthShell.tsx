import { Wordmark } from "@/components/marketing/Wordmark";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <main className="relative grid min-h-screen place-items-center px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[360px] w-[640px] -translate-x-1/2 rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(167,139,250,0.16), transparent)" }}
      />
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Wordmark />
        </div>
        <div className="rounded-xl border border-line bg-surface p-8 shadow-card">
          <h1 className="text-h2">{title}</h1>
          <p className="mt-1 text-body text-secondary">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
        <p className="mt-6 text-center text-body text-secondary">{footer}</p>
      </div>
    </main>
  );
}
