/**
 * Runs the Bangladesh catalog migration (see docs/GadgetWallet_Bangladesh_Product_Migration_Guide.md).
 *
 *   bun run scripts/migrate-bangladesh.ts
 *
 * Wipes existing product data, inserts the 60-product catalog, uploads
 * placeholder images to Supabase (product-images bucket) and sets thumbnails.
 */
import { migrateBangladeshCatalog } from "../packages/db/src/migrate-bangladesh.js";

async function main() {
  console.log("Running Bangladesh catalog migration...");
  await migrateBangladeshCatalog();
  console.log("Migration finished.");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
