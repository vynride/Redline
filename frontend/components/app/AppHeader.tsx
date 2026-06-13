"use client";

import { usePathname, useRouter } from "next/navigation";
import { Brand } from "@/components/app/Brand";
import { Avatar, Button } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/cn";

export function AppHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  function onLogout() {
    logout();
    router.replace("/login");
  }

  // The dashboard renders the full app-window (its own top bar), so the global
  // header would be a duplicate there, hide it on that route only.
  if (pathname === "/dashboard") return null;

  // Full-bleed pages (the live drill) span the viewport, so the header stretches
  // edge-to-edge to match instead of sitting in the centered content container.
  const fullBleed = pathname.startsWith("/drill/");

  return (
    <header className="sticky top-0 z-40 border-b border-panel-line bg-ink/80 backdrop-blur">
      <div
        className={cn(
          "flex h-16 items-center justify-between",
          fullBleed ? "px-5 sm:px-8" : "mx-auto max-w-[1180px] px-6",
        )}
      >
        <Brand />
        <div className="flex items-center gap-3">
          {user && (
            <span className="hidden items-center gap-2.5 sm:flex">
              <span className="text-body text-secondary">{user.display_name}</span>
              <Avatar src={user.avatar_url} name={user.display_name} size={32} />
            </span>
          )}
          <Button variant="ghost" onClick={onLogout}>
            Log out
          </Button>
        </div>
      </div>
    </header>
  );
}
