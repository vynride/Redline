"use client";

import { usePathname } from "next/navigation";

/**
 * The dashboard and live drill are full-bleed pages (they span the viewport and
 * manage their own spacing), so they opt out of the centered container that wraps
 * the other app pages.
 */
export function AppContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const fullBleed = pathname === "/dashboard" || pathname.startsWith("/drill/");
  if (fullBleed) return <>{children}</>;
  return <div className="mx-auto max-w-[1180px] px-6 py-12">{children}</div>;
}
