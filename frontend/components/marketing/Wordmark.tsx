import Link from "next/link";
import { cn } from "@/lib/cn";

export function Wordmark({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2 text-body-strong text-primary", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.svg" alt="Redline" width={28} height={28} className="h-7 w-7" />
      <span className="font-semibold tracking-tight">Redline</span>
    </Link>
  );
}
