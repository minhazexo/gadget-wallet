// Centralised runtime config.
//
// NOTE: `jwtSecret` deliberately has NO hardcoded fallback. The previous
// default ("gadget-wallet-super-secret-jwt-key") was committed to git, so any
// deployment missing JWT_SECRET would sign tokens with a publicly known key —
// letting anyone forge an admin token. Token signing/verification lives in
// middleware/auth.ts, which throws when JWT_SECRET is absent in production.
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET must be set in production (generate with: openssl rand -hex 32)");
}

export const config = {
  // Local/standalone only — Vercel routes requests to the serverless function
  // and ignores this. Kept in sync with apps/server/src/index.ts.
  port: Number(process.env.API_PORT || process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || "development",
  /** Undefined only in development, where middleware/auth.ts warns and uses a dev secret. */
  jwtSecret,
  /** Comma-separated list of allowed browser origins (production + preview URLs). */
  appUrl: process.env.APP_URL || "http://localhost:5173",
};
