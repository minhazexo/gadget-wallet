import { handle } from "hono/vercel";
// Import the PRE-BUNDLED CommonJS server, not the raw TS source.
//
// `apps/server` builds `src/app.ts` into a single self-contained
// `dist/app.cjs` (bun build --target=node --format=cjs) during the Vercel
// build. Importing the raw source (`../apps/server/src/app.js`) instead makes
// Vercel's function builder trace `.ts` files out of workspace packages
// (@gadget-wallet/db → packages/db/src/*.ts), which it does unreliably and
// which throws at runtime — so every /api/* call 500s and no data loads.
//
// The bundle is CommonJS on purpose: the root package.json has no
// `"type": "module"`, so this handler compiles to CJS and `require()`s the
// bundle. A required ESM `.js` would throw ERR_REQUIRE_ESM on Vercel's Node.
import { app } from "../apps/server/dist/app.cjs";

export default handle(app);
