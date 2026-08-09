/**
 * Single catch-all Vercel function.
 *
 * Every /api/* request lands here. We dispatch to the small handlers under
 * api-handlers/ (kept OUTSIDE the api/ directory so Vercel deploys exactly
 * ONE function — staying under the Hobby plan's 12-function limit).
 *
 * The handlers were written for Vercel's filesystem routing, where dynamic
 * segments arrive as req.query (e.g. api/products/[id].js → req.query.id).
 * This dispatcher reproduces that contract: it parses the URL, matches the
 * path against the route table, and merges path params + query params into
 * req.query before calling the handler.
 */
import { routes } from "../api-handlers/_routes.js";

export function parsePath(url) {
  // url is like "/api/products/featured?page=2" — strip the query string.
  const qIndex = url.indexOf("?");
  const path = qIndex === -1 ? url : url.slice(0, qIndex);
  const queryRaw = qIndex === -1 ? "" : url.slice(qIndex + 1);

  const query = {};
  const decode = (s) => decodeURIComponent(s.replace(/\+/g, " "));
  for (const part of queryRaw.split("&")) {
    if (!part) continue;
    const eq = part.indexOf("=");
    const key = decode(eq === -1 ? part : part.slice(0, eq));
    const value = eq === -1 ? "" : decode(part.slice(eq + 1));
    // Repeated keys → array (like Node's querystring). Single → string.
    if (key in query) {
      query[key] = Array.isArray(query[key]) ? [...query[key], value] : [query[key], value];
    } else {
      query[key] = value;
    }
  }

  // Path → segments, dropping the leading empty + "api" prefix.
  const segments = path
    .split("/")
    .filter(Boolean)
    .slice(1);
  return { segments, query };
}

/** Read + JSON.parse the request stream (only when content-type is JSON). */
function readJsonBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
    req.on("error", () => resolve({}));
  });
}

/**
 * Match a URL's path segments against a route list. Returns
 * { handler, params } for the first matching route, or null.
 * Exported so tests can exercise the matcher with injected routes.
 */
export function matchRoute(routes, segments) {
  for (const route of routes) {
    const pattern = route.pattern; // e.g. ["products", ":id"]
    if (pattern.length !== segments.length) continue;

    const captured = {};
    let ok = true;
    for (let i = 0; i < pattern.length; i++) {
      const part = pattern[i];
      if (part.startsWith(":")) {
        // Decode like Vercel's filesystem routing does (req.query.id was
        // already URL-decoded there, so handlers expect decoded values).
        let value = segments[i];
        try {
          value = decodeURIComponent(value);
        } catch {
          /* malformed encoding — pass through raw */
        }
        captured[part.slice(1)] = value;
      } else if (part !== segments[i]) {
        ok = false;
        break;
      }
    }
    if (ok) return { handler: route.handler, params: captured };
  }
  return null;
}

export default async function handler(req, res) {
  const { segments, query } = parsePath(req.url || "/api/");

  const matched = matchRoute(routes, segments);

  if (!matched) return res.status(404).json({ success: false, message: "Not found" });

  // Merge path params + query string into req.query (handler contract).
  req.query = { ...query, ...matched.params };
  // Handlers written for Vercel's runtime expect req.body for JSON posts.
  // If the runtime didn't pre-parse it, read the stream ourselves.
  if (req.body === undefined && (req.headers["content-type"] || "").includes("application/json")) {
    req.body = await readJsonBody(req);
  } else if (req.body === undefined) {
    req.body = {};
  }

  return matched.handler(req, res);
}
