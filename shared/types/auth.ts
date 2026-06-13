// TS mirror of the backend auth schemas (app/schemas/auth.py).

export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
}

export type OAuthProvider = "google" | "github";
