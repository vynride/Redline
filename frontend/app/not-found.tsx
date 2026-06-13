import Link from "next/link";
import { buttonStyles } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-10 bg-ink px-6 text-center">
      {/* Brand */}
      <Link href="/" className="relative flex items-center gap-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="Redline" width={28} height={28} className="h-7 w-7" />
        <span className="text-[1.05rem] font-semibold tracking-[0.12em] text-white">
          REDLINE
        </span>
      </Link>

      {/* Error block */}
      <div className="relative flex flex-col items-center gap-3">
        <p className="text-[6.5rem] font-bold leading-none tracking-tight tabular text-white">
          404
        </p>
        <h1 className="text-lg font-semibold tracking-[0.18em] text-white uppercase">
          Signal Lost
        </h1>
        <p className="mt-1 max-w-[280px] text-sm leading-relaxed text-secondary">
          The transmission you&apos;re looking for doesn&apos;t exist or has been
          terminated. Check your coordinates and try again.
        </p>
      </div>

      {/* Navigation */}
      <div className="relative flex flex-col items-center gap-3">
        <Link href="/dashboard" className={buttonStyles("primary")}>
          Return to Base
        </Link>
        <Link
          href="/"
          className="text-xs tracking-wide text-muted transition-colors hover:text-secondary"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
