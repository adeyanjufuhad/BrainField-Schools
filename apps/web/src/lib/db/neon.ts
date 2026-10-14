import "server-only";
import { neon } from "@neondatabase/serverless";

/** Application queries must use a restricted role and verified server-side permissions. */
export function getDatabase() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("Neon database is not configured.");
  return neon(connectionString);
}
