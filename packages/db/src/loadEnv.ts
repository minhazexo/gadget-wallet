import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

/**
 * Patterns that identify known placeholder / stale values (from .env.example
 * or early setup) that must never win over the real .env file.
 * Keep this list narrow — a matching real value should never exist.
 */
const PLACEHOLDER_PATTERNS: RegExp[] = [
  /user:password@ep-xxxx/,
  /your-service-role-key/,
  /your-super-secret-jwt-key/,
];

function isPlaceholder(value: string): boolean {
  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(value));
}

let loaded = false;

/**
 * Finds the repository root `.env` file by walking up from the current
 * working directory (works when the server runs from apps/server, packages/db
 * or the repo root). Only accepts a `.env` sitting beside a project marker
 * (package.json / turbo.json) so an unrelated parent directory's `.env`
 * can never be picked up.
 */
function findEnvFile(): string | null {
  let dir = process.cwd();
  for (let i = 0; i < 10; i++) {
    const envFile = join(dir, ".env");
    const hasProjectMarker = existsSync(join(dir, "package.json")) || existsSync(join(dir, "turbo.json"));
    if (hasProjectMarker && existsSync(envFile)) return envFile;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
  return null;
}

/** Strips surrounding quotes and any trailing inline comment from a value. */
function parseValue(raw: string): string {
  let value = raw.trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1).trim();
  }
  const commentIndex = value.indexOf(" #");
  return commentIndex === -1 ? value : value.slice(0, commentIndex).trim();
}

/**
 * Loads the root `.env` file with override semantics for stale values.
 *
 * Bun's `--env-file` flag does NOT override environment variables that are
 * already set, so a leftover placeholder DATABASE_URL in the environment
 * (e.g. injected by a dev sandbox or a stale shell export) would silently
 * break database connectivity. This loader ensures the real `.env` value is
 * used whenever the current value is missing, empty, or a known placeholder —
 * real environment variables (e.g. Vercel's DATABASE_URL) are left untouched.
 */
export function loadEnvWithOverride(): void {
  if (loaded) return;
  loaded = true;

  const envFile = findEnvFile();
  if (!envFile) return;

  const content = readFileSync(envFile, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;

    const key = trimmed.slice(0, eq).trim();
    const value = parseValue(trimmed.slice(eq + 1));

    const current = process.env[key];
    if (!current || isPlaceholder(current)) {
      process.env[key] = value;
    }
  }
}
