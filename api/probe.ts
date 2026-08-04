// TEMP diagnostic probe — remove after debugging the FUNCTION_INVOCATION_TIMEOUT.
import postgres from "postgres";

export default async function handler(req: Request) {
  const out: Record<string, unknown> = {
    ok: true,
    node: process.version,
    platform: process.platform,
    arch: process.arch,
    region: process.env.VERCEL_REGION || "?",
    env: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? `set(len=${process.env.DATABASE_URL.length})` : "MISSING",
      JWT_SECRET: process.env.JWT_SECRET ? `set(len=${process.env.JWT_SECRET.length})` : "MISSING",
      SUPABASE_URL: process.env.SUPABASE_URL ? `set(len=${process.env.SUPABASE_URL.length})` : "MISSING",
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "set" : "MISSING",
      APP_URL: process.env.APP_URL || "MISSING",
    },
  };

  try {
    const sql = postgres(process.env.DATABASE_URL || "postgres://invalid", {
      connect_timeout: 5,
      max: 1,
    });
    const t0 = Date.now();
    const res = await sql`select 1 as ok`;
    out.db = { connected: true, ms: Date.now() - t0, result: res[0]?.ok };
    await sql.end({ timeout: 2 });
  } catch (e) {
    out.db = { connected: false, error: String((e as Error)?.message || e).slice(0, 300) };
  }

  return new Response(JSON.stringify(out, null, 2), {
    headers: { "content-type": "application/json" },
  });
}
