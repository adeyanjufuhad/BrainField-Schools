import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";

const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || (process.platform === "win32" && existsSync(chrome) ? chrome : undefined);

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  workers: 1,
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:3001", launchOptions: { executablePath }, trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: { command: "npm run start", url: "http://127.0.0.1:3001", reuseExistingServer: !process.env.CI, timeout: 120_000 },
});
