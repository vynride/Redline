// TS mirror of the backend auth schemas (app/schemas/auth.py).

export interface User {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  user: User;
}
