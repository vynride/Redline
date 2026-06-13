"use client";

import { usePathname } from "next/navigation";

/**
 * The dashboard is a full-bleed page (its own sticky header + toolbar span the
 * viewport), so it opts out of the centered container that wraps other app pages.
 */
export function AppContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/dashboard") return <>{children}</>;
  return <div className="mx-auto max-w-[1180px] px-6 py-12">{children}</div>;
}
