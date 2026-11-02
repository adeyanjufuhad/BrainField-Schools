import { existsSync, readFileSync } from "node:fs";
import { test, expect, type Browser, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Exercises the administrator workspace against the seeded development database (npm run db:seed / db:seed-admin).
const accountsFile = ".dev-accounts.local.json";
const accounts: Record<string, { email: string; password: string; name: string }> = existsSync(accountsFile)
  ? Object.fromEntries(JSON.parse(readFileSync(accountsFile, "utf8")).accounts.map((account: { key: string }) => [account.key, account]))
  : {};

test.describe.configure({ mode: "serial", timeout: 180_000 });
test.skip(!accounts.admin, "Requires the seeded development database with a demo administrator (npm run db:seed-admin).");
test.beforeEach(({}, testInfo) => test.skip(testInfo.project.name !== "desktop", "Administration runs once, on desktop."));

const stamp = Date.now().toString(36).toUpperCase();
const className = `Test Class ${stamp}`;
const subjectName = `Test Subject ${stamp}`;
const teacherName = `Test Teacher ${stamp}`;
const studentName = `Test Student ${stamp}`;
const admission = `T-${stamp}`;
const created: { teacher?: { login: string; password: string }; student?: { login: string; password: string } } = {};

async function signIn(browser: Browser, login: string, password: string, expected: RegExp): Promise<Page> {
  const page = await (await browser.newContext()).newPage();
  await page.goto("/portal");
  for (let attempt = 0; attempt < 2; attempt++) {
    await page.getByLabel("Email address or admission number").fill(login);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();
    const welcome = page.getByRole("heading", { level: 1, name: expected });
    await expect(welcome.or(page.locator("#sign-in-error"))).toBeVisible({ timeout: 30_000 });
    if (await welcome.isVisible()) return page;
    await page.waitForTimeout(15_000); // Neon Auth briefly throttles rapid repeated sign-ins.
  }
  await expect(page.getByRole("heading", { level: 1, name: expected })).toBeVisible();
  return page;
}

const signInAs = (browser: Browser, key: string) => signIn(browser, accounts[key].email, accounts[key].password, new RegExp(`Welcome, ${accounts[key].name}`));

async function readCredentials(page: Page, name: string) {
  const panel = page.getByRole("region", { name: `Sign-in details for ${name}` });
  await expect(panel).toBeVisible({ timeout: 20_000 });
  return { login: (await panel.locator("dd").first().textContent())!.trim(), password: (await panel.locator(".credential-password").textContent())!.trim() };
}

test("only administrators can open school setup, and administrators get no academic workspaces", async ({ browser }) => {
  const teacher = await signInAs(browser, "maths");
  await expect(teacher.getByRole("navigation", { name: "Portal" }).getByRole("link", { name: "School setup" })).toHaveCount(0);
  await teacher.goto("/portal/admin");
  await expect(teacher).toHaveURL(/\/portal$/);
  await teacher.goto("/portal/admin/people");
  await expect(teacher).toHaveURL(/\/portal$/);

  const admin = await signInAs(browser, "admin");
  const nav = admin.getByRole("navigation", { name: "Portal" });
  await expect(nav.getByRole("link", { name: "School setup" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Class results" })).toHaveCount(0);
  await admin.goto("/portal/classes");
  await expect(admin).toHaveURL(/\/portal$/);
});

test("an administrator adds a class, subject, teacher and student with sign-ins", async ({ browser }) => {
  const admin = await signInAs(browser, "admin");
  await admin.goto("/portal/admin");
  await admin.getByLabel("New class name").fill(className);
  await admin.getByRole("button", { name: "Add class" }).click();
  await expect(admin.getByText(`${className} added.`)).toBeVisible({ timeout: 20_000 });
  await admin.getByLabel("New class name").fill(className.toLowerCase());
  await admin.getByRole("button", { name: "Add class" }).click();
  await expect(admin.getByRole("alert").filter({ hasText: "already exists" })).toBeVisible();
  await expect(admin.getByLabel("New class name")).toHaveValue(className.toLowerCase());
  await admin.getByLabel("New subject name").fill(subjectName);
  await admin.getByRole("button", { name: "Add subject" }).click();
  await expect(admin.getByText(`${subjectName} added.`)).toBeVisible({ timeout: 20_000 });

  await admin.goto("/portal/admin/people");
  await admin.getByLabel("Full name").first().fill(teacherName);
  await admin.getByLabel("Email address for sign-in").fill(`test.teacher.${stamp.toLowerCase()}@example.com`);
  await admin.getByRole("button", { name: "Add staff member" }).click();
  created.teacher = await readCredentials(admin, teacherName);
  expect(created.teacher.password).toMatch(/^[a-z2-9]{4}(-[a-z2-9]{4}){3}$/);

  const studentForm = admin.getByRole("form", { name: "Add a student" });
  await studentForm.getByLabel("Full name").fill(studentName);
  await studentForm.getByLabel("Admission number", { exact: true }).fill(admission);
  await studentForm.getByLabel("Class this term").selectOption({ label: className });
  await studentForm.getByRole("button", { name: "Add student" }).click();
  created.student = await readCredentials(admin, studentName);
  expect(created.student.login).toBe(admission);

  await admin.goto("/portal/admin");
  const classSection = admin.getByRole("region", { name: className });
  await expect(classSection).toContainText("1 student enrolled");
  await classSection.getByLabel(`${subjectName} teacher for ${className}`).selectOption({ label: teacherName });
  await classSection.getByRole("row", { name: new RegExp(subjectName) }).getByRole("button", { name: "Save" }).click();
  await expect(classSection.getByText("Subject teacher saved.")).toBeVisible({ timeout: 20_000 });
  await classSection.getByLabel(`Class teacher for ${className}`).selectOption({ label: accounts.english.name });
  await classSection.getByRole("row", { name: /Class teacher/ }).getByRole("button", { name: "Save" }).click();
  await expect(classSection.getByText("Class teacher saved.")).toBeVisible({ timeout: 20_000 });

  const result = await new AxeBuilder({ page: admin }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(result.violations).toEqual([]);
});

/** A temporary password opens only the change-password page until it is replaced. */
async function choosePassword(page: Page, current: string, name: string) {
  const next = `${current}-mine-${stamp}`;
  await page.getByLabel(/Temporary password from the school|Current password/).fill(current);
  await page.getByLabel("New password", { exact: true }).fill(next);
  await page.getByLabel("Type the new password again").fill(next);
  await page.getByRole("button", { name: "Change password" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Your password has been changed." })).toBeVisible({ timeout: 30_000 });
  await page.getByRole("link", { name: "Continue to the portal" }).click();
  await expect(page.getByRole("heading", { level: 1, name: new RegExp(`Welcome, ${name}`) })).toBeVisible({ timeout: 30_000 });
  return next;
}

test("new sign-ins must replace their temporary password before anything else opens", async ({ browser }) => {
  test.skip(!created.teacher || !created.student, "Depends on the previous test.");
  const teacher = await signIn(browser, created.teacher!.login, created.teacher!.password, /Choose your own password/);
  await expect(teacher).toHaveURL(/\/portal\/account$/);
  const nav = teacher.getByRole("navigation", { name: "Portal" });
  await expect(nav.getByRole("link")).toHaveText(["Account"]);
  await teacher.goto("/portal/teaching");
  await expect(teacher).toHaveURL(/\/portal\/account$/);

  await teacher.getByLabel("Temporary password from the school").fill("not-the-right-password");
  await teacher.getByLabel("New password", { exact: true }).fill("a-long-enough-password");
  await teacher.getByLabel("Type the new password again").fill("a-long-enough-password");
  await teacher.getByRole("button", { name: "Change password" }).click();
  await expect(teacher.getByRole("alert").filter({ hasText: "Your current password is not correct." })).toBeVisible({ timeout: 30_000 });
  await teacher.getByLabel("Temporary password from the school").fill(created.teacher!.password);
  await teacher.getByLabel("New password", { exact: true }).fill("a-long-enough-password");
  await teacher.getByLabel("Type the new password again").fill("a-different-password");
  await teacher.getByRole("button", { name: "Change password" }).click();
  await expect(teacher.getByRole("alert").filter({ hasText: "don’t match" })).toBeVisible();

  const result = await new AxeBuilder({ page: teacher }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(result.violations).toEqual([]);
  created.teacher!.password = await choosePassword(teacher, created.teacher!.password, teacherName);

  const student = await signIn(browser, created.student!.login, created.student!.password, /Choose your own password/);
  created.student!.password = await choosePassword(student, created.student!.password, studentName);
});

test("an administrator resets a forgotten password, which signs the person out and needs replacing", async ({ browser }) => {
  test.skip(!created.student?.password.includes("-mine-"), "Depends on the previous test.");
  const student = await signIn(browser, created.student!.login, created.student!.password, new RegExp(`Welcome, ${studentName}`));

  const admin = await signInAs(browser, "admin");
  await admin.goto("/portal/admin/people");
  await expect(admin.getByRole("row", { name: /\(you\)/ }).getByRole("button", { name: "Reset password" })).toHaveCount(0);
  const row = admin.getByRole("row", { name: new RegExp(studentName) });
  await row.getByRole("button", { name: "Reset password" }).click();
  await row.getByRole("button", { name: `Yes, reset ${studentName}’s password` }).click();
  const reset = await readCredentials(admin, studentName);
  expect(reset.login).toBe(admission);
  expect(reset.password).toMatch(/^[a-z2-9]{4}(-[a-z2-9]{4}){3}$/);
  await admin.reload();
  await expect(admin.getByRole("row", { name: new RegExp(studentName) }).getByText("Temporary password")).toBeVisible();

  // The student's existing session no longer reaches their results.
  await student.goto("/portal/results");
  await expect(student).not.toHaveURL(/\/portal\/results$/);

  const again = await signIn(browser, created.student!.login, reset.password, /Choose your own password/);
  created.student!.password = await choosePassword(again, reset.password, studentName);
  await expect(admin.getByRole("heading", { name: "Recent changes" })).toBeVisible();
});

test("the new teacher can work once signed in, and removing access takes effect at once", async ({ browser }) => {
  test.skip(!created.teacher?.password.includes("-mine-"), "Depends on the password test.");
  const teacher = await signIn(browser, created.teacher!.login, created.teacher!.password, new RegExp(`Welcome, ${teacherName}`));
  await teacher.getByRole("navigation", { name: "Portal" }).getByRole("link", { name: "My score sheets" }).click();
  await teacher.getByRole("link", { name: new RegExp(`Enter scores for ${subjectName}, ${className}`) }).click();
  await expect(teacher).toHaveURL(url => url.pathname.startsWith("/portal/teaching/"), { timeout: 30_000 });
  await expect(teacher.getByLabel(`CA score for ${studentName}`)).toBeVisible({ timeout: 30_000 });

  const admin = await signInAs(browser, "admin");
  await admin.goto("/portal/admin/people");
  const row = admin.getByRole("row", { name: new RegExp(teacherName) });
  await row.getByRole("button", { name: "Remove access" }).click();
  await row.getByRole("button", { name: "Yes, remove access" }).click();
  await expect(row.getByText("Access removed").first()).toBeVisible({ timeout: 20_000 });

  await teacher.reload();
  await expect(teacher.getByText("This account has been deactivated by the school.")).toBeVisible();
  await expect(admin.getByRole("heading", { name: "Recent changes" })).toBeVisible();
});
