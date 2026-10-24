import { existsSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { test, expect } from "@playwright/test";
import { neon } from "@neondatabase/serverless";

// Calls the database directly as the web application's restricted role, bypassing the UI, to prove the
// workflow rules live in the database. Runs only against the seeded development database.
const configured = existsSync(".env.local") && existsSync(".dev-accounts.local.json");
if (configured) process.loadEnvFile(".env.local");

test.skip(!configured, "Requires the seeded development database (npm run db:seed).");
test.beforeEach(({}, testInfo) => test.skip(testInfo.project.name !== "desktop", "Database checks run once."));

async function failure(promise: Promise<unknown>) {
  try { await promise; } catch (error) { return error as { code?: string; message: string }; }
  throw new Error("Expected the database to refuse this operation.");
}

test("workflow functions refuse the wrong person, whatever the sheet's state", async () => {
  const sql = neon(process.env.DATABASE_URL!);
  const [ids] = await sql`
    select
      (select s.id from app.subject_sheets s join app.subject_offerings o on o.id = s.offering_id join app.subjects sb on sb.id = o.subject_id where sb.name = 'Mathematics') as maths_sheet,
      (select s.version from app.subject_sheets s join app.subject_offerings o on o.id = s.offering_id join app.subjects sb on sb.id = o.subject_id where sb.name = 'Mathematics') as maths_version,
      (select o.teacher_id from app.subject_offerings o join app.subjects sb on sb.id = o.subject_id where sb.name = 'Mathematics') as maths_teacher,
      (select o.teacher_id from app.subject_offerings o join app.subjects sb on sb.id = o.subject_id where sb.name = 'Physics') as physics_teacher,
      (select id from app.profiles where kind = 'student' order by admission_number limit 1) as student,
      (select id from app.enrolments limit 1) as enrolment`;
  const batch = await sql`select id, version from app.result_batches limit 1`;

  const rows = JSON.stringify([{ enrolmentId: ids.enrolment, ca: 40, exam: 60, attendance: "present" }]);
  expect((await failure(sql`select app.save_scores(${ids.physics_teacher}, ${ids.maths_sheet}, ${ids.maths_version}, ${rows}::jsonb)`)).code).toBe("BF403");
  expect((await failure(sql`select app.review_sheet(${ids.maths_teacher}, ${ids.maths_sheet}, ${ids.maths_version}, true, '')`)).code).toBe("BF403");
  expect((await failure(sql`select app.submit_sheet(${randomUUID()}, ${ids.maths_sheet}, ${ids.maths_version})`)).code).toBe("BF401");
  if (batch.length) {
    expect((await failure(sql`select app.publish_batch(${ids.student}, ${batch[0].id}, ${batch[0].version})`)).code).toBe("BF403");
    expect((await failure(sql`select app.vp_decide(${ids.maths_teacher}, ${batch[0].id}, ${batch[0].version}, true, '')`)).code).toBe("BF403");
  }
});

test("the application role cannot write tables or call internal helpers directly", async () => {
  const sql = neon(process.env.DATABASE_URL!);
  const [ids] = await sql`select (select id from app.subject_sheets limit 1) as sheet, (select id from app.enrolments limit 1) as enrolment, (select id from app.profiles limit 1) as profile`;
  expect((await failure(sql`insert into app.scores (sheet_id, enrolment_id, ca, exam, updated_by) values (${ids.sheet}, ${ids.enrolment}, 40, 60, ${ids.profile})`)).code).toBe("42501");
  expect((await failure(sql`update app.published_reports set snapshot = '{}'::jsonb`)).code).toBe("42501");
  expect((await failure(sql`insert into app.role_grants (profile_id, role) values (${ids.profile}, 'publisher')`)).code).toBe("42501");
  expect((await failure(sql`select app.batch_sheets_intact(${randomUUID()})`)).code).toBe("42501");
});
