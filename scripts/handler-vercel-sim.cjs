// Simulates Vercel exactly: CWD has NO .env (loadEnvWithOverride is a no-op),
// all env comes from process.env. If this hangs, we've reproduced the platform hang locally.
const { handle } = require("hono/vercel");
const { app } = require("../apps/server/dist/app.cjs");

console.log("[sim] module loaded, creating handler...");
const handler = handle(app);
console.log("[sim] handler created, invoking /api/health...");
const t0 = Date.now();
handler(new Request("https://example.com/api/health"))
  .then(async (res) => {
    console.log("[sim] RESPONSE", res.status, (await res.text()).slice(0, 120), "in", Date.now() - t0, "ms");
    process.exit(0);
  })
  .catch((e) => {
    console.log("[sim] ERROR", e.message);
    process.exit(1);
  });
setTimeout(() => {
  console.log("[sim] TIMEOUT after 15s - module load or request hung!");
  process.exit(2);
}, 15000);
