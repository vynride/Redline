"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { buttonStyles } from "@/components/ui";
import { useAuth } from "@/lib/auth";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_state: "Your sign-in session expired before it could finish. Please try again.",
  oauth_failed: "We couldn't verify your account with the provider. Please try again.",
  access_denied: "Sign-in was cancelled.",
};

function CallbackHandler() {
  const { completeLogin } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const token = params.get("token");
    const err = params.get("error");
    if (err || !token) {
      setError(ERROR_MESSAGES[err ?? ""] ?? "Sign-in failed. Please try again.");
      return;
    }
    completeLogin(token)
      .then(() => router.replace("/dashboard"))
      .catch(() => setError("We couldn't complete your sign-in. Please try again."));
  }, [params, completeLogin, router]);

  if (error) {
    return (
      <AuthShell
        title="Sign-in failed"
        subtitle={error}
        footer={
          <Link href="/login" className="text-violet-400 hover:underline">
            Back to sign in
          </Link>
        }
      >
        <Link href="/login" className={buttonStyles("primary", "w-full")}>
          Try again
        </Link>
      </AuthShell>
    );
  }

  return (
    <div className="grid min-h-screen place-items-center text-secondary">
      <span className="text-body">Signing you in…</span>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center text-secondary">
          <span className="text-body">Signing you in…</span>
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
