// The server bundle (`apps/server/dist/app.cjs`) is generated at build time by
// `bun build`, so it has no shipped type declarations. This ambient module
// gives `api/[[...route]].ts` the type of the exported Hono `app` without
// pulling the raw TypeScript source into Vercel's function trace.
declare module "*/app.cjs" {
  import type { Hono } from "hono";
  export const app: Hono;
  const _default: Hono;
  export default _default;
}
