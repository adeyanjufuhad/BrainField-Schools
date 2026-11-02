// Creates the Neon Auth service account the server uses to reset passwords, and gives it the Auth "admin" role.
// It is linked to no school profile, so it can never open the portal. Safe to run once per Neon Auth project.
// Usage: npm run auth:service-account
// Writes NEON_AUTH_SERVICE_EMAIL and NEON_AUTH_SERVICE_PASSWORD to apps/web/.env.local (gitignored). For a
// deployed site, copy both values into the host's server-only environment variables. Never prefix them NEXT_PUBLIC.
import { randomBytes } from "node:crypto";
import { appendFile } from "node:fs/promises";
import { Pool, neonConfig } from "@neondatabase/serverless";

try { process.loadEnvFile(".env.local"); } catch { /* use the process environment */ }
const { DATABASE_OWNER_URL, NEON_AUTH_BASE_URL, NEON_AUTH_SERVICE_EMAIL } = process.env;
if (!DATABASE_OWNER_URL || !NEON_AUTH_BASE_URL) throw new Error("Set DATABASE_OWNER_URL and NEON_AUTH_BASE_URL in apps/web/.env.local.");
if (NEON_AUTH_SERVICE_EMAIL) { console.log("A service account is already configured (NEON_AUTH_SERVICE_EMAIL is set)."); process.exit(0); }

// The reserved .invalid domain never receives mail, so nobody can request a reset link for this account.
const email = `portal-service-${randomBytes(4).toString("hex")}@service.brainfield.invalid`;
const password = randomBytes(32).toString("base64url");
const response = await fetch(`${NEON_AUTH_BASE_URL}/sign-up/email`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Origin: "http://localhost:3001" },
  body: JSON.stringify({ email, password, name: "Portal service (password resets)" }),
});
const body = await response.json().catch(() => ({}));
if (!response.ok || !body.user?.id) throw new Error(`Could not create the service account: ${response.status} ${body.message ?? ""}`);

neonConfig.webSocketConstructor = WebSocket;
const pool = new Pool({ connectionString: DATABASE_OWNER_URL });
try {
  const { rowCount } = await pool.query(`update neon_auth."user" set role = 'admin' where id = $1`, [body.user.id]);
  if (rowCount !== 1) throw new Error("The service account was created but could not be given the Auth admin role.");
  const { rows } = await pool.query("select 1 from app.profiles where auth_user_id = $1", [body.user.id]);
  if (rows.length) throw new Error("Refusing: the service account is linked to a school profile.");
} finally {
  await pool.end();
}
await appendFile(".env.local", `\n# Server-only Auth account for administrator password resets (npm run auth:service-account)\nNEON_AUTH_SERVICE_EMAIL=${email}\nNEON_AUTH_SERVICE_PASSWORD=${password}\n`);
console.log("Service account created. NEON_AUTH_SERVICE_EMAIL and NEON_AUTH_SERVICE_PASSWORD were added to apps/web/.env.local.");
