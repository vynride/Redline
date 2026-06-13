"use client";

import { useRouter } from "next/navigation";
import { Wordmark } from "@/components/marketing/Wordmark";
import { Button } from "@/components/ui";
import { useAuth } from "@/lib/auth";

export function AppHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();

  function onLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-base/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
        <Wordmark />
        <div className="flex items-center gap-4">
          {user && <span className="hidden text-body text-secondary sm:inline">{user.display_name}</span>}
          <Button variant="ghost" onClick={onLogout}>
            Log out
          </Button>
        </div>
      </div>
    </header>
  );
}
