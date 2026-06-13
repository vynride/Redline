"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

/** Wrap protected pages, redirects to /login once we know there is no session. */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return <LoadingScreen />;
  }
  return (
    <div style={{ animation: "redline-fade-up 0.4s ease-out forwards" }}>
      {children}
    </div>
  );
}
