// One-off helper: replace empty Vercel env vars with real values from root .env
// Usage: VERCEL_TOKEN=... node set-vercel-env.mjs
import { readFileSync } from "node:fs";

const TOKEN = process.env.VERCEL_TOKEN;
const PROJECT = "prj_lFN0bjfVmK5PBRfAvVe4oUKoz19Q";
const BASE = `https://api.vercel.com/v9/projects/${PROJECT}/env`;

const WANT = [
  "DATABASE_URL",
  "JWT_SECRET",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "APP_URL",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
];

// Read root .env
const envFile = readFileSync(".env", "utf8");
const env = {};
for (const line of envFile.split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const eq = t.indexOf("=");
  if (eq <= 0) continue;
  let value = t.slice(eq + 1).trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1).trim();
  }
  env[t.slice(0, eq).trim()] = value;
}

// APP_URL real production domain
env.APP_URL = "https://gadget-wallet.vercel.app";

async function api(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* not json */ }
  return { status: res.status, json, text };
}

// 1. List existing env entries (via project detail — the /env list endpoint is finicky)
const proj = await api("GET", `https://api.vercel.com/v9/projects/${PROJECT}`);
const existing = (proj.json?.env || []);
console.log("existing entries:", existing.map((e) => `${e.key}@${e.target.join(",")}`).join(" | ") || "(none)");

// 2. Delete entries for our keys (empty or not — recreate cleanly)
for (const key of WANT) {
  const entries = existing.filter((e) => e.key === key);
  for (const e of entries) {
    const del = await api("DELETE", `${BASE}/${e.id}`);
    console.log(`DELETE ${key} (${e.id}) -> ${del.status}`);
  }
}

// 3. Create fresh entries with real values
for (const key of WANT) {
  const value = env[key];
  if (!value) {
    console.log(`SKIP ${key}: not present in .env`);
    continue;
  }
  const created = await api("POST", BASE, {
    key,
    value,
    type: "encrypted",
    target: ["production", "preview"],
  });
  console.log(`POST ${key} -> ${created.status} ${created.json?.error?.code || ""} ${created.json?.key ? "OK" : created.text.slice(0, 120)}`);
}

// 4. Verify
const verify = await api("GET", BASE);
for (const e of verify.json?.env || []) {
  if (WANT.includes(e.key)) {
    console.log(`VERIFY ${e.key} | targets: ${e.target.join(",")} | type: ${e.type} | value: ${JSON.stringify(e.value)}`);
  }
}
