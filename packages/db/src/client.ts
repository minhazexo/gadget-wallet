import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

export function createPgClient() {
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add your Neon PostgreSQL connection string to Environment Variables.",
    );
  }

  return postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });
}

export const client = connectionString
  ? postgres(connectionString, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    })
  : (null as any);
