// Applies db/migrations/*.sql in order with the owner role. Usage: npm run db:migrate
// Creates the restricted brainfield_app login role (password from BRAINFIELD_APP_PASSWORD) when missing.
import { readdir, readFile } from "node:fs/promises";
import { Pool, neonConfig } from "@neondatabase/serverless";

try { process.loadEnvFile(".env.local"); } catch { /* use the process environment */ }
const { DATABASE_OWNER_URL, BRAINFIELD_APP_PASSWORD } = process.env;
if (!DATABASE_OWNER_URL || !BRAINFIELD_APP_PASSWORD) throw new Error("Set DATABASE_OWNER_URL and BRAINFIELD_APP_PASSWORD in apps/web/.env.local.");

neonConfig.webSocketConstructor = WebSocket;
const pool = new Pool({ connectionString: DATABASE_OWNER_URL });
const client = await pool.connect();
try {
  await client.query("create table if not exists public.schema_migrations (name text primary key, applied_at timestamptz not null default now())");
  const { rows: role } = await client.query("select 1 from pg_roles where rolname = 'brainfield_app'");
  if (!role.length) {
    const { rows: [{ statement }] } = await client.query(
      "select format('create role brainfield_app login password %L nosuperuser nocreatedb nocreaterole nobypassrls noinherit', $1::text) as statement",
      [BRAINFIELD_APP_PASSWORD],
    );
    await client.query(statement);
    await client.query("grant connect on database brainfield to brainfield_app");
    console.log("created role brainfield_app");
  }
  const applied = new Set((await client.query("select name from public.schema_migrations")).rows.map(row => row.name));
  const files = (await readdir("db/migrations")).filter(file => file.endsWith(".sql")).sort();
  for (const file of files) {
    if (applied.has(file)) continue;
    await client.query("begin");
    try {
      await client.query(await readFile(`db/migrations/${file}`, "utf8"));
      await client.query("insert into public.schema_migrations (name) values ($1)", [file]);
      await client.query("commit");
      console.log("applied", file);
    } catch (error) {
      await client.query("rollback");
      throw new Error(`${file}: ${error.message}`);
    }
  }
  console.log("migrations up to date");
} finally {
  client.release();
  await pool.end();
}
