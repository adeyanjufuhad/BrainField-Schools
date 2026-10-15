import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("school identity, campuses, contact links, and sourced historical achievements", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  await expect(page).toHaveTitle(/Brainfield Schools Lagos/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Bright minds.");
  await expect(page.locator(".brand-crest").first()).toBeVisible();
  const heroPhoto = page.locator(".hero-art");
  await expect(heroPhoto).toHaveAttribute("alt", /Jubril Dokun/);
  await expect(heroPhoto).toHaveJSProperty("complete", true);
  expect(await heroPhoto.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  await expect(page.locator(".hero-visual figcaption")).toContainText("Photo: Brainfield Schools Lagos");
  await expect(page.locator('img[src*="brainfield-campus.svg"]')).toHaveCount(0);
  await expect(page.locator("#campuses address").first()).toContainText("39/40 Powerline Avenue");
  await expect(page.locator("#campuses address").last()).toContainText("32/34 Ekoro Road");
  const campusWidths = await page.locator(".campus-card").evaluateAll(items => items.map(item => item.getBoundingClientRect().width));
  expect(Math.abs(campusWidths[0] - campusWidths[1])).toBeLessThan(2);
  for (const phone of ["8032367229", "7084370636", "8024147831"]) {
    await expect(page.locator(`a[href="tel:+234${phone}"]`).first()).toBeVisible();
  }
  await expect(page.locator("#achievements")).toContainText("Babalola David");
  await expect(page.locator("#achievements")).toContainText("InterswitchSPAK 6.0");
  await expect(page.locator("#jamb-2025")).toContainText("Babalola David");
  await expect(page.locator("#jamb-2025")).not.toContainText("354");
  await expect(page.locator("#jamb-2025")).toContainText("Ayomide Victoria");
  await expect(page.locator("#jamb-2025")).toContainText("364");
  await expect(page.locator("#achievements a[href^='https://']")).toHaveCount(2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test("student-moment tabs support keyboard selection and show sourced event photographs", async ({ page }) => {
  await page.goto("/");
  const science = page.getByRole("tab", { name: /Science opportunities/ });
  await science.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: /National competitions/ })).toBeFocused();
  await expect(page.getByRole("tabpanel")).toContainText("winning moment");
  await expect(page.getByRole("tabpanel").getByRole("img", { name: /Jubril Dokun/ })).toHaveAttribute("alt", /Jubril Dokun/);
  await page.keyboard.press("Home");
  await expect(science).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toContainText("opens new doors");
  const delegationPhoto = page.getByRole("tabpanel").getByRole("img", { name: /Lagos Sakura Science Programme delegation/ });
  await expect(delegationPhoto).toHaveAttribute("alt", /Lagos Sakura Science Programme delegation/);
  await expect(delegationPhoto).toHaveJSProperty("complete", true);
  expect(await delegationPhoto.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  await expect(page.getByRole("tabpanel")).toContainText("Photo: Edugist");
});

test("FAQ disclosure and honest portal availability", async ({ page }) => {
  await page.goto("/");
  await page.getByText("How can I find out about admissions?", { exact: true }).click();
  await expect(page.locator("details[open]")).toContainText("08032367229");
  await page.getByRole("link", { name: "School portal", exact: true }).first().click();
  await expect(page).toHaveURL(/\/portal$/);
  await expect(page.getByText("Portal access is not available yet.")).toBeVisible();
  await page.getByRole("link", { name: "Back to the school website" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Bright minds.");
});

test("mobile navigation expands and closes after selecting a section", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile navigation only");
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  const navigation = page.getByRole("navigation", { name: "Mobile navigation" });
  await expect(navigation).toBeVisible();
  await navigation.getByRole("link", { name: "Gallery" }).click();
  await expect(navigation).toHaveCount(0);
  await expect(page).toHaveURL(/\/gallery$/);
});

test("landing page passes automated WCAG A/AA checks", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: /National competitions/ }).click();
  const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(result.violations).toEqual([]);
});

test("unconfigured authentication fails clearly without accepting credentials", async ({ request }) => {
  const response = await request.get("/api/auth/get-session");
  expect(response.status()).toBe(503);
  expect(await response.json()).toEqual({ error: "School authentication is not configured yet." });
  expect(response.headers()["cache-control"]).toBe("no-store");
});

test("slideshow changes every three seconds without controls and pauses on focus", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  const slideshow = page.getByRole("region", { name: "School awards and published JAMB results" });
  await expect(slideshow.getByRole("slider")).toHaveCount(0);
  await expect(slideshow.getByRole("button")).toHaveCount(0);
  await page.clock.runFor(3100);
  await expect(slideshow.getByRole("img")).toHaveAttribute("alt", /2025 UTME score of 364/);
  await slideshow.getByRole("link").focus();
  await page.clock.runFor(6000);
  await expect(slideshow.getByRole("img")).toHaveAttribute("alt", /2025 UTME score of 364/);
  await page.getByRole("heading", { level: 1 }).click();
  await page.mouse.move(0, 0);
  await page.clock.runFor(3100);
  await expect(slideshow.getByRole("img")).toHaveAttribute("alt", /2025 UTME results poster, including/);
});

test("reduced motion stops slideshow zoom and preserves gallery access", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.install();
  await page.goto("/");
  const slideshow = page.getByRole("region", { name: "School awards and published JAMB results" });
  await page.clock.runFor(9000);
  await expect(slideshow.getByRole("img")).toHaveAttribute("alt", /Jubril Dokun/);
  await expect(slideshow.getByRole("img")).toHaveCSS("animation-name", "none");
  await expect(slideshow.getByRole("link")).toHaveAttribute("href", "/gallery?category=photos");
});

test("scroll reveals leave sections readable after entering the viewport", async ({ page }) => {
  await page.goto("/");
  for (const selector of [".academic-feature", ".recent-story", ".campus-card", ".admissions-contact"]) {
    const section = page.locator(selector).first();
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible();
    await expect(section).toHaveCSS("opacity", "1");
    await expect(section).toHaveCSS("transform", "none");
  }
});
