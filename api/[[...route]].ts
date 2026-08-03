/**
 * Vercel serverless entry point (auto-detected from the root `api/` folder).
 *
 * ⚠️ The filename MUST be `[[...route]].ts` — the ellipsis is what makes it a
 * true catch-all. Vercel only treats `[[...route]]` (or `[...route]`) as a
 * catch-all; plain `[[route]]` matches a single optional segment, so nested
 * API paths like /api/products/featured would return a platform 404.
 *
 * The Hono app is pre-bundled by `bun run --cwd apps/server build:vercel` into a
 * single self-contained, Node-compatible **CommonJS** file
 * (`apps/server/dist/app.cjs`). Vercel compiles this handler to CJS (the root
 * package.json has no `"type": "module"`), so it must require() a CJS bundle —
 * require()ing an ESM `.js` file (anything under a `"type": "module"` package)
 * throws ERR_REQUIRE_ESM on Vercel's Node 18/20 runtime.
 *
 * The Vercel function lives under `/api/*`, and Hono routes are registered with
 * the `/api` prefix, so `app.fetch(request)` matches everything as-is.
 */
import { app } from "../apps/server/dist/app.cjs";

export default async function handler(request: Request): Promise<Response> {
  return app.fetch(request);
}
