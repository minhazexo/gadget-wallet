import { app } from "./app";

// Local dev / standalone runner (Bun only).
// Vercel does NOT use this file — production serves the plain Node handlers
// under api/ (see docs/gadget-wallet-vercel-update-guide.md). This file only
// adds the Bun HTTP listener so `bun run dev` / `bun run start` work locally.
//
// API_PORT wins over PORT so that running the web and API together (root
// `bun run dev`) can't collide: Vite also reads PORT, so a single shared PORT
// would point both processes at the same port. Must stay 3000 by default —
// client/vite.config.ts proxies /api there.
const port = Number(process.env.API_PORT || process.env.PORT || 3000);

Bun.serve({ port, fetch: app.fetch });
console.log(`Server running on http://localhost:${port}`);
