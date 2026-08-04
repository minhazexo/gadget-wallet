// TEMP diagnostic — minimal function with zero imports.
export default function handler() {
  return new Response(
    JSON.stringify({
      pong: true,
      node: process.version,
      region: process.env.VERCEL_REGION || "?",
      env: {
        DATABASE_URL: process.env.DATABASE_URL ? `set(len=${process.env.DATABASE_URL.length})` : "MISSING",
        JWT_SECRET: process.env.JWT_SECRET ? "set" : "MISSING",
        SUPABASE_URL: process.env.SUPABASE_URL ? "set" : "MISSING",
      },
    }),
    { status: 200, headers: { "content-type": "application/json" } },
  );
}
