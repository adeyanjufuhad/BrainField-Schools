import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { test, expect, type Browser, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Runs only against the seeded development database (npm run db:seed writes the account file).
const accountsFile = ".dev-accounts.local.json";
const accounts: Record<string, { email: string; password: string; name: string }> = existsSync(accountsFile)
  ? Object.fromEntries(JSON.parse(readFileSync(accountsFile, "utf8")).accounts.map((account: { key: string }) => [account.key, account]))
  : {};

test.describe.configure({ mode: "serial", timeout: 180_000 });
test.skip(!existsSync(accountsFile), "Requires the seeded development database (npm run db:seed).");

async function signIn(browser: Browser, key: string): Promise<Page> {
  const page = await (await browser.newContext()).newPage();
  await page.goto("/portal");
  await page.getByLabel("School email address").fill(accounts[key].email);
  await page.getByLabel("Password").fill(accounts[key].password);
  await page.getByRole("button", { name: "Sign in" }).click();
  const welcome = page.getByRole("heading", { level: 1, name: `Welcome, ${accounts[key].name}` });
  // Neon Auth briefly throttles rapid repeated sign-ins; retry once after a pause.
  if (!(await welcome.isVisible({ timeout: 10_000 }).catch(() => false)) && await page.locator("#sign-in-error").isVisible()) {
    await page.waitForTimeout(15_000);
    await page.getByLabel("Password").fill(accounts[key].password);
    await page.getByRole("button", { name: "Sign in" }).click();
  }
  await expect(welcome).toBeVisible({ timeout: 15_000 });
  return page;
}

async function enterScores(page: Page, subject: string, scores: ([number, number] | "absent")[]) {
  await page.getByRole("navigation", { name: "Portal" }).getByRole("link", { name: "My score sheets" }).click();
  await page.getByRole("link", { name: new RegExp(`Enter scores for ${subject}`) }).click();
  for (const [index, score] of scores.entries()) {
    const student = `Demo Student ${String(index + 1).padStart(3, "0")}`;
    if (score === "absent") { await page.getByLabel(`Attendance for ${student}`).selectOption("absent"); continue; }
    await page.getByLabel(`CA score for ${student}`).fill(String(score[0]));
    await page.getByLabel(`Exam score for ${student}`).fill(String(score[1]));
  }
  await page.getByRole("button", { name: "Save scores" }).click();
  await expect(page.getByText(/Saved at/)).toBeVisible({ timeout: 20_000 });
  await page.getByRole("button", { name: "Submit for review" }).click();
  await page.getByRole("button", { name: "Yes, submit" }).click();
  await expect(page.getByText("Waiting for review")).toBeVisible();
}

async function openClass(page: Page) {
  await page.getByRole("navigation", { name: "Portal" }).getByRole("link", { name: "Class results" }).click();
  await page.getByRole("link", { name: /Open SS 1 Demo/ }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("SS 1 Demo");
}

const mark = (base: number): [number, number][] => Array.from({ length: 6 }, (_, index) => [Math.min(40, base + index * 2), Math.min(60, base + 10 + index * 3)]);

test.beforeAll(({}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "The shared workflow runs once, on desktop.");
  execFileSync(process.execPath, ["scripts/db-reset-demo.mjs"], { stdio: "inherit" });
});

test.beforeEach(({}, testInfo) => test.skip(testInfo.project.name !== "desktop", "The shared workflow runs once, on desktop."));

test("sign-in rejects wrong passwords and students start with no published results", async ({ browser, page }) => {
  await page.goto("/portal");
  await page.getByLabel("School email address").fill(accounts.student001.email);
  await page.getByLabel("Password").fill("not-the-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.locator("#sign-in-error")).toContainText("don’t match a school account");
  await expect(page.getByLabel("School email address")).toHaveValue(accounts.student001.email);

  const student = await signIn(browser, "student001");
  await student.getByRole("link", { name: "My results", exact: true }).first().click();
  await expect(student.getByText("No published results yet")).toBeVisible();
  await student.goto("/portal/director");
  await expect(student).toHaveURL(/\/portal$/);
  await student.goto("/portal/teaching");
  await expect(student).toHaveURL(/\/portal$/);
});

test("subject teachers validate, save and submit their sheets", async ({ browser }) => {
  const maths = await signIn(browser, "maths");
  await maths.getByRole("navigation", { name: "Portal" }).getByRole("link", { name: "My score sheets" }).click();
  await maths.getByRole("link", { name: /Enter scores for Mathematics/ }).click();
  await maths.getByLabel("CA score for Demo Student 001").fill("45");
  await expect(maths.getByText("Must be 40 or less.")).toBeVisible();
  await expect(maths.getByRole("button", { name: "Save scores" })).toBeDisabled();
  await enterScores(maths, "Mathematics", mark(24));

  const physics = await signIn(browser, "physics");
  await enterScores(physics, "Physics", [...mark(20).slice(0, 5), "absent"]);
  // A teacher cannot open another teacher's sheet for review.
  const sheetUrl = maths.url().replace("/teaching/", "/review/");
  await physics.goto(sheetUrl);
  await expect(physics.getByText("Page not found")).toBeVisible();
});

test("class teacher returns a sheet with a reason and the teacher corrects it", async ({ browser }) => {
  const classTeacher = await signIn(browser, "english");
  await enterScores(classTeacher, "English Language", mark(22));
  await openClass(classTeacher);
  await expect(classTeacher.getByRole("button", { name: "Approve class results" })).toBeDisabled();
  await classTeacher.getByRole("link", { name: "Review Mathematics" }).click();
  await classTeacher.getByRole("button", { name: "Return for correction" }).click();
  await classTeacher.getByLabel("What needs correcting?").fill("Demo Student 002 exam score looks too low.");
  await classTeacher.getByRole("button", { name: "Return sheet" }).click();
  await expect(classTeacher.getByText("Sheet returned to the teacher.")).toBeVisible();
  await classTeacher.getByRole("link", { name: /Back to SS 1 Demo/ }).click();
  await classTeacher.getByRole("link", { name: "Review Physics" }).click();
  await classTeacher.getByRole("button", { name: "Accept sheet" }).click();
  await expect(classTeacher.getByText("Sheet accepted.")).toBeVisible();

  const maths = await signIn(browser, "maths");
  await maths.getByRole("navigation", { name: "Portal" }).getByRole("link", { name: "My score sheets" }).click();
  await expect(maths.getByText("Demo Student 002 exam score looks too low.")).toBeVisible();
  await maths.getByRole("link", { name: /Enter scores for Mathematics/ }).click();
  await maths.getByLabel("Exam score for Demo Student 002").fill("55");
  await maths.getByRole("button", { name: "Save scores" }).click();
  await expect(maths.getByText(/Saved at/)).toBeVisible();
  await maths.getByRole("button", { name: "Submit for review" }).click();
  await maths.getByRole("button", { name: "Yes, submit" }).click();
  await expect(maths.getByText("Revision 2", { exact: true })).toBeVisible();

  await classTeacher.goto(maths.url().replace("/teaching/", "/review/"));
  await classTeacher.getByRole("button", { name: "Accept sheet" }).click();
  await expect(classTeacher.getByText("Sheet accepted.")).toBeVisible();
});

test("the VP independently reviews the class teacher's own sheet, then approvals follow in order", async ({ browser }) => {
  const vp = await signIn(browser, "vp");
  await openClass(vp);
  await vp.getByRole("link", { name: "Review English Language" }).click();
  await expect(vp.getByText("Independent review")).toBeVisible();
  await vp.getByRole("button", { name: "Accept sheet" }).click();
  await expect(vp.getByText("Sheet accepted.")).toBeVisible();

  const classTeacher = await signIn(browser, "english");
  await openClass(classTeacher);
  await classTeacher.getByRole("button", { name: "Approve class results" }).click();
  await classTeacher.getByRole("button", { name: "Yes, send to the VP" }).click();
  await expect(classTeacher.getByText("Class results approved and sent to the VP.")).toBeVisible();

  await openClass(vp);
  await vp.getByRole("button", { name: "Give final approval" }).click();
  await vp.getByRole("button", { name: "Yes, approve" }).click();
  await expect(vp.getByText("Final approval given.")).toBeVisible();
  await expect(vp.getByRole("button", { name: "Publish to students" })).toHaveCount(0);

  const student = await signIn(browser, "student001");
  await student.getByRole("link", { name: "My results", exact: true }).first().click();
  await expect(student.getByText("No published results yet")).toBeVisible();
});

test("publishing freezes report cards for students and feeds the director dashboard", async ({ browser }) => {
  const director = await signIn(browser, "director");
  await director.getByRole("link", { name: "Director dashboard" }).first().click();
  await expect(director.getByText("No published results yet")).toBeVisible();
  await expect(director.getByRole("table").last()).toContainText("VP approved");

  const principal = await signIn(browser, "principal");
  await openClass(principal);
  await principal.getByRole("button", { name: "Publish to students" }).click();
  await principal.getByRole("button", { name: "Yes, publish now" }).click();
  await expect(principal.getByText("Results published.")).toBeVisible();

  const student = await signIn(browser, "student002");
  await student.getByRole("link", { name: "My results", exact: true }).first().click();
  const card = student.getByRole("article");
  await expect(card).toContainText("SS 1 Demo report card");
  await expect(card).toContainText("Demo Student 002");
  await expect(card.getByRole("row", { name: /Mathematics/ })).toContainText("26");
  await expect(card.getByRole("row", { name: /Mathematics/ })).toContainText("55");
  await expect(card).not.toContainText("Demo Student 001");

  await director.reload();
  await expect(director.getByText("Students with published results")).toBeVisible();
  await expect(director.locator(".stat-tiles")).toContainText("6");
  await expect(director.getByRole("row", { name: /Physics/ })).toContainText("(5 of 5)");
  await director.getByLabel("Subject", { exact: true }).selectOption("Physics");
  await director.getByRole("button", { name: "Apply" }).click();
  await expect(director).toHaveURL(/subject=Physics/);
  await expect(director.getByRole("row", { name: /Mathematics/ })).toHaveCount(0);

  for (const page of [director, student]) {
    const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(result.violations).toEqual([]);
  }
});
