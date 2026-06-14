"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { loginWith, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  return (
    <AuthShell
      title="Welcome to Redline"
      subtitle="Sign in to run a drill and review your debriefs."
    >
      <div className="flex flex-col gap-3">
        <Button variant="secondary" className="w-full gap-3" onClick={() => loginWith("google")}>
          <GoogleIcon />
          Continue with Google
        </Button>
      </div>
    </AuthShell>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden focusable="false">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8a12 12 0 1 1 0-24c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 1 0 24 44a20 20 0 0 0 19.6-23.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8A12 12 0 0 1 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A12 12 0 0 1 12.7 28l-6.5 5A20 20 0 0 0 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C39.8 35.6 44 30.4 44 24c0-1.2-.1-2.4-.4-3.5z" />
    </svg>
  );
}
