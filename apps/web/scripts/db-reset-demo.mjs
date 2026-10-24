// Resets the synthetic development workflow to blank draft sheets so the end-to-end test can replay it.
// Refuses to run unless the database contains only the seeded development school. Usage: npm run db:reset-demo
import { Pool, neonConfig } from "@neondatabase/serverless";

try { process.loadEnvFile(".env.local"); } catch { /* use the process environment */ }
const { DATABASE_OWNER_URL } = process.env;
if (!DATABASE_OWNER_URL) throw new Error("Set DATABASE_OWNER_URL in apps/web/.env.local.");

neonConfig.webSocketConstructor = WebSocket;
const pool = new Pool({ connectionString: DATABASE_OWNER_URL });
const client = await pool.connect();
try {
  const { rows } = await client.query("select name from app.schools");
  if (rows.length !== 1 || !rows[0].name.endsWith("(development data)")) throw new Error("Refusing to reset: this is not the synthetic development database.");
  await client.query("begin");
  for (const table of ["published_reports", "workflow_events", "batch_sheets", "result_batches", "scores"]) await client.query(`delete from app.${table}`);
  await client.query("update app.subject_sheets set status = 'draft', revision = 1, version = 1, return_reason = null, submitted_at = null, accepted_by = null, accepted_at = null, updated_at = now()");
  await client.query("commit");
  console.log("Development workflow reset to blank draft sheets.");
} catch (error) {
  await client.query("rollback").catch(() => {});
  throw error;
} finally {
  client.release();
  await pool.end();
}
