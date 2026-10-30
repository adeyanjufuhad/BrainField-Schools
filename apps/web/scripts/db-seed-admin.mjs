// Adds the demo administrator to an already-seeded development database. Safe to run more than once.
// Usage: npm run db:seed-admin
import { randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { Pool, neonConfig } from "@neondatabase/serverless";

try { process.loadEnvFile(".env.local"); } catch { /* use the process environment */ }
const { DATABASE_OWNER_URL, NEON_AUTH_BASE_URL } = process.env;
if (!DATABASE_OWNER_URL || !NEON_AUTH_BASE_URL) throw new Error("Set DATABASE_OWNER_URL and NEON_AUTH_BASE_URL in apps/web/.env.local.");
const person = { key: "admin", name: "Demo Administrator", email: "demo.admin@example.com" };

neonConfig.webSocketConstructor = WebSocket;
const pool = new Pool({ connectionString: DATABASE_OWNER_URL });
const client = await pool.connect();
try {
  const { rows: schools } = await client.query("select id, name from app.schools");
  if (schools.length !== 1 || !schools[0].name.endsWith("(development data)")) throw new Error("Refusing: this is not the synthetic development database.");
  const { rows: existing } = await client.query("select 1 from app.role_grants where role = 'administrator' and revoked_at is null");
  if (existing.length) { console.log("An administrator already exists."); process.exit(0); }

  const password = randomBytes(18).toString("base64url");
  const response = await fetch(`${NEON_AUTH_BASE_URL}/sign-up/email`, { method: "POST", headers: { "Content-Type": "application/json", Origin: "http://localhost:3001" }, body: JSON.stringify({ email: person.email, password, name: person.name }) });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.user?.id) throw new Error(`Could not create the Auth account: ${response.status} ${body.message ?? ""}`);

  await client.query("begin");
  const { rows: [profile] } = await client.query("insert into app.profiles (school_id, auth_user_id, full_name, kind) values ($1, $2, $3, 'staff') returning id", [schools[0].id, body.user.id, person.name]);
  await client.query("insert into app.role_grants (profile_id, role) values ($1, 'administrator')", [profile.id]);
  await client.query("commit");

  const file = ".dev-accounts.local.json";
  const data = JSON.parse(await readFile(file, "utf8"));
  data.accounts = [...data.accounts.filter(account => account.key !== person.key), { ...person, password }];
  await writeFile(file, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`Added ${person.name}. Sign-in details: apps/web/${file}`);
} catch (error) {
  await client.query("rollback").catch(() => {});
  throw error;
} finally {
  client.release();
  await pool.end();
}
