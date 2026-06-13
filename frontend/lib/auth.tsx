"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { API_BASE } from "./config";
import { clearToken, getToken, setToken } from "./storage";
import type { OAuthProvider, User } from "@shared/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  /** Redirect the browser to the provider's consent screen to begin login. */
  loginWith: (provider: OAuthProvider) => void;
  /** Persist the token returned by the OAuth callback and load the user. */
  completeLogin: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchMe(token: string): Promise<User> {
  const resp = await fetch(`${API_BASE}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) throw new Error("Your session has expired. Please log in again.");
  return (await resp.json()) as User;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    fetchMe(token)
      .then((u) => setUser(u))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const loginWith = useCallback((provider: OAuthProvider) => {
    window.location.href = `${API_BASE}/api/auth/${provider}/login`;
  }, []);

  const completeLogin = useCallback(async (token: string) => {
    setToken(token);
    setUser(await fetchMe(token));
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, loginWith, completeLogin, logout }),
    [user, loading, loginWith, completeLogin, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
