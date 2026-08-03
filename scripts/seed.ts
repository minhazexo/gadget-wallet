import { runSeeds } from "../packages/db/seeds/index.js";

async function main() {
  console.log("Running database seed script...");
  await runSeeds();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
