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

test("the new teacher and student can sign in, and removing access takes effect at once", async ({ browser }) => {
  test.skip(!created.teacher || !created.student, "Depends on the previous test.");
  const teacher = await signIn(browser, created.teacher!.login, created.teacher!.password, new RegExp(`Welcome, ${teacherName}`));
  await teacher.getByRole("navigation", { name: "Portal" }).getByRole("link", { name: "My score sheets" }).click();
  await teacher.getByRole("link", { name: new RegExp(`Enter scores for ${subjectName}, ${className}`) }).click();
  await expect(teacher).toHaveURL(url => url.pathname.startsWith("/portal/teaching/"), { timeout: 30_000 });
  await expect(teacher.getByLabel(`CA score for ${studentName}`)).toBeVisible({ timeout: 30_000 });

  const student = await signIn(browser, created.student!.login, created.student!.password, new RegExp(`Welcome, ${studentName}`));
  await expect(student.getByRole("navigation", { name: "Portal" }).getByRole("link", { name: "My results" })).toBeVisible();

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
