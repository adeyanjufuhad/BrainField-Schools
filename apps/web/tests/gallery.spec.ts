import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("gallery navigation and categories show the verified public archive", async ({ page, isMobile }) => {
  await page.goto("/");
  if (isMobile) await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("navigation", { name: isMobile ? "Mobile navigation" : "Main navigation" }).getByRole("link", { name: "Gallery", exact: true }).click();
  await expect(page).toHaveURL(/\/gallery$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Determination.");
  await expect(page.locator(".gallery-grid > article")).toHaveCount(13);
  await expect(page.locator(".gallery-result-heading")).toContainText("13 published records");
  await page.getByRole("navigation", { name: "Gallery categories" }).getByRole("link", { name: /Achievements/ }).click();
  await expect(page.locator(".gallery-grid > article")).toHaveCount(8);
  await expect(page).toHaveURL(/category=achievements/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("year and search filters persist in the URL and survive refresh", async ({ page }) => {
  await page.goto("/gallery?category=achievements");
  await page.getByLabel("Year", { exact: true }).selectOption("2025");
  await page.getByRole("button", { name: "Apply filters" }).click();
  await expect(page).toHaveURL(/year=2025/);
  await expect(page.locator(".gallery-grid > article")).toHaveCount(1);
  await expect(page.locator(".gallery-collection .gallery-grid")).toContainText("Sakura");
  await page.reload();
  await expect(page.getByLabel("Year", { exact: true })).toHaveValue("2025");
  await page.getByLabel("Year", { exact: true }).selectOption("all");
  await page.getByLabel("Search stories or students").fill("Seidu");
  await page.getByRole("button", { name: "Apply filters" }).click();
  await expect(page).toHaveURL(/q=Seidu/);
  await expect(page.locator(".gallery-grid > article")).toHaveCount(2);
  await expect(page.locator(".gallery-collection .gallery-grid")).not.toContainText("Jubril");
});

test("2025 JAMB highlights use the school posters and keep historical results separate", async ({ page }) => {
  await page.goto("/gallery?category=results&year=2025");
  await expect(page.locator(".gallery-grid > article")).toHaveCount(2);
  await expect(page.locator("#main-content .gallery-grid")).toContainText("Babalola David");
  await expect(page.locator("#main-content .gallery-grid")).toContainText("Ayomide Victoria");
  await expect(page.locator(".gallery-result-art").first()).toContainText("364");
  await expect(page.locator("#main-content .gallery-grid")).not.toContainText("354");
  await expect(page.locator("#main-content .gallery-grid")).toContainText("English 73");
  await page.goto("/gallery?category=results&year=2022");
  await expect(page.locator(".gallery-grid > article")).toHaveCount(1);
  await expect(page.locator(".gallery-result-art")).toContainText("354");
  await expect(page.locator(".gallery-result-art")).toContainText("2022 UTME");
});

test("a search without matches has a working reset", async ({ page }) => {
  await page.goto("/gallery?q=no-published-student-with-this-name");
  await expect(page.locator(".gallery-empty")).toContainText("Let’s widen the search");
  await page.getByRole("link", { name: "Clear filters and explore" }).click();
  await expect(page.locator(".gallery-grid > article")).toHaveCount(13);
});

test("official champion videos load on request with an independent YouTube fallback", async ({ page }) => {
  await page.route("https://www.youtube-nocookie.com/**", route => route.fulfill({ contentType: "text/html", body: "<p>External video placeholder for the integration test.</p>" }));
  await page.goto("/gallery?category=videos");
  await expect(page.locator("iframe")).toHaveCount(0);
  await expect(page.locator('a[href="https://www.youtube.com/watch?v=2249BfVqz7o"]')).toBeVisible();
  await page.getByRole("button", { name: "Play video: Meet our national STEM champion." }).click();
  await expect(page.locator("iframe")).toHaveAttribute("src", "https://www.youtube-nocookie.com/embed/2249BfVqz7o?autoplay=1&rel=0");
  await expect(page.locator("iframe")).toHaveAttribute("title", /Jubril Dokun/);
  await page.getByRole("button", { name: "Close video player" }).click();
  await expect(page.locator("iframe")).toHaveCount(0);
});

test("gallery, 2025 results and photo archive pass automated accessibility checks", async ({ page }) => {
  for (const url of ["/gallery", "/gallery?category=results&year=2025", "/gallery?category=photos&year=2025"]) {
    await page.goto(url);
    const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(result.violations).toEqual([]);
  }
});

test("photo archive preserves readable originals and year/search filters", async ({ page }) => {
  await page.goto("/gallery?category=photos&year=2025&q=UTME");
  await expect(page.locator(".school-photo-card")).toHaveCount(3);
  await expect(page.locator(".gallery-result-heading")).toContainText("3 published photos");
  const original = page.getByRole("link", { name: /Open full-size image: The school’s published 2025 results poster/ });
  await expect(original).toHaveAttribute("href", "/photos/utme-2025-main.jpg");
  await expect(original).toHaveAttribute("target", "_blank");
  await page.reload();
  await expect(page.getByLabel("Year", { exact: true })).toHaveValue("2025");
  await expect(page.getByLabel("Search stories or students")).toHaveValue("UTME");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("React Bits reveals respect reduced motion and preserve readable content", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/gallery?category=photos&year=2025");
  const reveal = page.locator('[data-react-bits="fade-content"]').first();
  await reveal.scrollIntoViewIfNeeded();
  await expect(reveal).toBeVisible();
  await expect(reveal).toHaveCSS("opacity", "1");
  await expect(reveal).toHaveCSS("transform", "none");
});
