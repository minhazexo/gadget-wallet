import { rmSync, existsSync } from "fs";
import { join } from "path";

const targets = [
  "client/dist",
  "apps/server/dist",
  "packages/db/dist",
  "packages/ui/dist",
  "packages/types/dist",
  ".turbo",
  "node_modules/.cache"
];

console.log("Cleaning build artifacts...");

for (const target of targets) {
  const fullPath = join(process.cwd(), target);
  if (existsSync(fullPath)) {
    console.log(`Removing ${target}...`);
    rmSync(fullPath, { recursive: true, force: true });
  }
}

console.log("Cleanup complete.");
