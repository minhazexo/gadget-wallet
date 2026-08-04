// TEMP diagnostic — isolates whether importing postgres / connecting to Neon hangs in the sandbox.
const race = (p: Promise<unknown>, ms: number, label: string) =>
  Promise.race([p.then(() => label + "-ok"), new Promise((r) => setTimeout(() => r(label + "-timeout"), ms))]);

export default async function handler() {
  const out: Record<string, unknown> = {
    ok: true,
    node: process.version,
    region: process.env.VERCEL_REGION || "?",
  };

  // 1. Can we import postgres at runtime?
  out.importPostgres = await race(import("postgres"), 10_000, "import-postgres");

  // 2. DNS lookup of the Neon host
  try {
    const host = new URL(process.env.DATABASE_URL || "postgres://x").hostname;
    out.dbHost = host;
    out.dns = await race(
      import("node:dns").then((d) => d.promises.lookup(host).then((r) => r.address)),
      8_000,
      "dns",
    );
  } catch (e) {
    out.dns = "dns-error: " + String((e as Error).message).slice(0, 150);
  }

  // 3. Actual connect attempt with a hard race
  try {
    const sql = (await import("postgres")).default(process.env.DATABASE_URL || "postgres://invalid", {
      connect_timeout: 4,
      max: 1,
    });
    const t0 = Date.now();
    const res = await race(sql`select 1 as ok`, 6_000, "connect");
    out.connect = res;
    out.connectMs = Date.now() - t0;
    try {
      await sql.end({ timeout: 2 });
    } catch {
      /* ignore */
    }
  } catch (e) {
    out.connect = "connect-error: " + String((e as Error).message).slice(0, 200);
  }

  return new Response(JSON.stringify(out, null, 2), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
