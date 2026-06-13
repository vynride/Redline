import Link from "next/link";
import { cn } from "@/lib/cn";

/** The Redline wordmark used across the app + auth, white logo glyph + REDLINE. */
export function Brand({ href = "/dashboard", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5 text-white", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.svg" alt="Redline" width={28} height={28} className="h-7 w-7" />
      <span className="text-[1.05rem] font-semibold tracking-[0.12em]">REDLINE</span>
    </Link>
  );
}
