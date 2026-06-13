import Link from "next/link";
import { cn } from "@/lib/cn";

export function Wordmark({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2 text-body-strong text-primary", className)}>
      <span className="grid h-7 w-7 place-items-center rounded-md bg-cta-gradient text-on-accent">
        <span className="text-[15px] font-bold leading-none">M</span>
      </span>
      <span className="font-semibold tracking-tight">Redline</span>
    </Link>
  );
}
