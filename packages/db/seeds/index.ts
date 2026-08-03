import { seedDatabase } from "../src/seed.js";

export async function runSeeds() {
  console.log("Starting seed process...");
  await seedDatabase();
  console.log("Seeding complete.");
}
