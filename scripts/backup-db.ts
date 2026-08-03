import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";

async function backup() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL is not defined in environment.");
    process.exit(1);
  }

  const backupDir = join(process.cwd(), "backups");
  if (!existsSync(backupDir)) {
    mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outputFile = join(backupDir, `db-backup-${timestamp}.sql`);

  console.log(`Creating database backup to ${outputFile}...`);
  try {
    execSync(`pg_dump "${dbUrl}" > "${outputFile}"`, { stdio: "inherit" });
    console.log("Database backup completed successfully.");
  } catch (error) {
    console.error("Backup failed:", error);
  }
}

backup();
