/**
 * Vercel serverless entry point (auto-detected from the root `api/` folder).
 *
 * The Hono app is pre-bundled by `bun run --cwd apps/server build:vercel` into a
 * single self-contained, Node-compatible file (`apps/server/dist/app.js`), so
 * Vercel's function builder only has to trace one JS file — no raw workspace
 * TypeScript (`@gadget-wallet/db`, etc.) to resolve at deploy time.
 *
 * The Vercel function lives under `/api/*`, and Hono routes are registered with
 * the `/api` prefix, so `app.fetch(request)` matches everything as-is.
 */
import { app } from "../apps/server/dist/app.js";

export default async function handler(request: Request): Promise<Response> {
  return app.fetch(request);
}
