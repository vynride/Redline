import { Brand } from "@/components/app/Brand";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-ink px-6">
      {/* Aurora glow behind the card */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/4 h-[40vh] w-[40vh] -translate-x-1/2 rounded-full bg-violet-deep/30 blur-[120px]" />
        <div className="absolute right-1/4 top-1/3 h-[30vh] w-[30vh] rounded-full bg-cyan-deep/15 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Brand href="/" />
        </div>
        <div className="glass-strong gradient-border overflow-hidden rounded-2xl p-8 shadow-glass">
          <h1 className="text-h2 text-white">{title}</h1>
          <p className="mt-1 text-body text-secondary">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
        {footer && <p className="mt-6 text-center text-body text-secondary">{footer}</p>}
      </div>
    </main>
  );
}
