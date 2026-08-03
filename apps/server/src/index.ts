import { app } from "./app";

// ─── Local dev / standalone runner (Bun) ─────────────────────────────
// Vercel does NOT use this file — it boots the same `app` from app.ts via
// the serverless entry at /api/[[...route]].ts. This file only adds the Bun
// HTTP listener so `bun run dev` / `bun run start` work locally.
const port = parseInt(process.env.PORT || "3000");

Bun.serve({ port, fetch: app.fetch });
console.log(`Server running on http://localhost:${port}`);
