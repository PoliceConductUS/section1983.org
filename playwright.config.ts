import { defineConfig, devices } from "@playwright/test";

// Accessibility suite. It runs against the production build in dist/, so run
// `npm run build` first (the npm scripts do).
const PORT = Number(process.env.A11Y_PORT || 41983);
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "tests/a11y",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: { baseURL },
  webServer: {
    command: "node tests/a11y/serve-dist.mjs",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [
    {
      // axe, assistive-technology structure, and zoom/reflow.
      name: "desktop",
      testIgnore: ["forced-colors.spec.ts", "ios-zoom.spec.ts"],
      use: { ...devices["Desktop Chrome"] },
    },
    {
      // Windows High Contrast / forced-colors rendering.
      name: "forced-colors",
      testMatch: "forced-colors.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        contextOptions: { forcedColors: "active" },
      },
    },
    {
      // Mobile Safari engine at iPhone size.
      name: "ios",
      testMatch: "ios-zoom.spec.ts",
      use: { ...devices["iPhone 13"] },
    },
  ],
});
