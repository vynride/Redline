/** @type {import('next').NextConfig} */

// The API/WebSocket origin the browser must be allowed to reach (CSP connect-src).
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";
const WS_BASE = API_BASE.replace(/^http/, "ws"); // http->ws, https->wss
const isDev = process.env.NODE_ENV !== "production";

// Next injects inline bootstrap/hydration scripts, so a nonce-less policy needs
// 'unsafe-inline' for script/style; React Refresh additionally needs 'unsafe-eval'
// in dev. Tightening to nonces is tracked as a follow-up (SECURITY_REVIEW.md M7).
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data: https:", // Google/GitHub avatar URLs
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  `connect-src 'self' ${API_BASE} ${WS_BASE}`,
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  // Voice app: keep the microphone for same-origin getUserMedia; drop camera/geolocation.
  { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=(self)" },
];

const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_BASE: API_BASE,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
