// Seeds clearly labelled synthetic data for development: one class, three subjects, six students and one
// demo account per role. Creates Neon Auth accounts with random passwords and links them to profiles.
// Generated sign-in details are written to .dev-accounts.local.json (gitignored). Usage: npm run db:seed
import { randomBytes } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { Pool, neonConfig } from "@neondatabase/serverless";

try { process.loadEnvFile(".env.local"); } catch { /* use the process environment */ }
const { DATABASE_OWNER_URL, NEON_AUTH_BASE_URL } = process.env;
if (!DATABASE_OWNER_URL || !NEON_AUTH_BASE_URL) throw new Error("Set DATABASE_OWNER_URL and NEON_AUTH_BASE_URL in apps/web/.env.local.");

const staff = [
  { key: "maths", name: "Demo Teacher · Mathematics", email: "demo.maths@example.com" },
  { key: "english", name: "Demo Class Teacher · English", email: "demo.classteacher@example.com" },
  { key: "physics", name: "Demo Teacher · Physics", email: "demo.physics@example.com" },
  { key: "vp", name: "Demo VP Administration", email: "demo.vp@example.com", roles: ["vp_admin"] },
  { key: "principal", name: "Demo Principal", email: "demo.principal@example.com", roles: ["principal", "publisher"] },
  { key: "director", name: "Demo Director", email: "demo.director@example.com", roles: ["director"] },
];
const students = Array.from({ length: 6 }, (_, index) => {
  const number = String(index + 1).padStart(3, "0");
  return { key: `student${number}`, name: `Demo Student ${number}`, admission: `BF-DEMO-${number}`, email: index < 2 ? `demo.student${number}@example.com` : null };
});

async function authAccount(person) {
  const password = randomBytes(18).toString("base64url");
  const headers = { "Content-Type": "application/json", Origin: "http://localhost:3001" };
  const response = await fetch(`${NEON_AUTH_BASE_URL}/sign-up/email`, { method: "POST", headers, body: JSON.stringify({ email: person.email, password, name: person.name }) });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.user?.id) throw new Error(`Could not create the Auth account for ${person.email}: ${response.status} ${body.message ?? ""}. Run with a fresh development branch.`);
  return { id: body.user.id, password };
}

neonConfig.webSocketConstructor = WebSocket;
const pool = new Pool({ connectionString: DATABASE_OWNER_URL });
const client = await pool.connect();
const accounts = [];
try {
  const { rows: existing } = await client.query("select 1 from app.schools limit 1");
  if (existing.length) throw new Error("The database already has school data. Seed a fresh development branch instead.");

  const people = [...staff, ...students];
  for (const person of people) if (person.email) person.auth = await authAccount(person);

  await client.query("begin");
  const one = async (text, values) => (await client.query(text, values)).rows[0];
  const school = await one("insert into app.schools (name) values ('Brainfield Schools Lagos (development data)') returning id");
  const policy = await one(
    `insert into app.grading_policies (school_id, name, ca_max, exam_max, pass_mark, bands, school_approved)
     values ($1, 'Example policy (awaiting school approval)', 40, 60, 40, $2, false) returning id`,
    [school.id, JSON.stringify([{ grade: "A", min: 70 }, { grade: "B", min: 60 }, { grade: "C", min: 50 }, { grade: "D", min: 45 }, { grade: "E", min: 40 }, { grade: "F", min: 0 }])],
  );
  const session = await one("insert into app.academic_sessions (school_id, name) values ($1, '2026/2027') returning id", [school.id]);
  const term = await one("insert into app.terms (school_id, session_id, name, ordinal, grading_policy_id, is_current) values ($1, $2, 'First term', 1, $3, true) returning id", [school.id, session.id, policy.id]);
  const klass = await one("insert into app.classes (school_id, name) values ($1, 'SS 1 Demo') returning id", [school.id]);

  const profile = {};
  for (const person of staff) {
    profile[person.key] = (await one("insert into app.profiles (school_id, auth_user_id, full_name, kind) values ($1, $2, $3, 'staff') returning id", [school.id, person.auth.id, person.name])).id;
    for (const role of person.roles ?? []) await client.query("insert into app.role_grants (profile_id, role) values ($1, $2)", [profile[person.key], role]);
  }
  for (const person of students) {
    profile[person.key] = (await one("insert into app.profiles (school_id, auth_user_id, full_name, kind, admission_number) values ($1, $2, $3, 'student', $4) returning id", [school.id, person.auth?.id ?? null, person.name, person.admission])).id;
    await client.query("insert into app.enrolments (school_id, student_id, class_id, term_id) values ($1, $2, $3, $4)", [school.id, profile[person.key], klass.id, term.id]);
  }
  await client.query("insert into app.class_teachers (class_id, term_id, school_id, teacher_id) values ($1, $2, $3, $4)", [klass.id, term.id, school.id, profile.english]);
  for (const [subjectName, teacher] of [["Mathematics", "maths"], ["English Language", "english"], ["Physics", "physics"]]) {
    const subject = await one("insert into app.subjects (school_id, name) values ($1, $2) returning id", [school.id, subjectName]);
    const offering = await one("insert into app.subject_offerings (school_id, class_id, subject_id, term_id, teacher_id) values ($1, $2, $3, $4, $5) returning id", [school.id, klass.id, subject.id, term.id, profile[teacher]]);
    await client.query("insert into app.subject_sheets (offering_id) values ($1)", [offering.id]);
  }
  await client.query("commit");

  for (const person of people) if (person.auth) accounts.push({ key: person.key, name: person.name, email: person.email, password: person.auth.password });
  await writeFile(".dev-accounts.local.json", `${JSON.stringify({ note: "Synthetic development accounts. Never use for real data. Do not commit.", accounts }, null, 2)}\n`);
  console.log(`Seeded ${staff.length} staff and ${students.length} students. Sign-in details: apps/web/.dev-accounts.local.json`);
} catch (error) {
  await client.query("rollback").catch(() => {});
  throw error;
} finally {
  client.release();
  await pool.end();
}
