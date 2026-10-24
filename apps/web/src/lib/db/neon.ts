import "server-only";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let sql: NeonQueryFunction<false, false> | undefined;

/** Application queries use the restricted brainfield_app role: reads plus workflow functions only. */
export function getDatabase() {
  if (sql) return sql;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("Neon database is not configured.");
  sql = neon(connectionString);
  return sql;
}

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

/** Workflow functions raise BF4xx codes with messages written for the user; anything else stays generic. */
export class WorkflowError extends Error {}

export async function runWorkflow<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
    if (code.startsWith("BF") && error instanceof Error) throw new WorkflowError(error.message);
    console.error("Workflow call failed", error);
    throw new WorkflowError("Something went wrong while saving. Your work has not been changed. Please try again.");
  }
}
