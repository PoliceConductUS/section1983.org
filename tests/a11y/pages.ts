import fs from "node:fs";
import path from "node:path";
import { test as base, expect } from "@playwright/test";

// One page for every template in src/pages, plus the 404 page.
export const templatePages = [
  "/",
  "/about/",
  "/about/section-1983/",
  "/accessibility/",
  "/articles/",
  "/articles/damages-and-how-to-document-them-in-a-section-1983-case/",
  "/cases/",
  "/cases/adams-v-metiva/",
  "/cases/circuit/fifth/",
  "/cases/state/alaska/",
  "/cases/topic/body-camera/",
  "/downloads/",
  "/get-involved/",
  "/legal-notice/",
  "/process/",
  "/process/discovery/",
  "/search/",
  "/sitemap/",
  "/statute-of-limitations/",
  "/statute-of-limitations/alabama/",
  "/terms/",
  "/terms-and-concepts/",
  "/terms-and-concepts/absolute-immunity/",
  "/404.html",
];

// Every built page, read from dist/. Used when A11Y_FULL=1.
export function allPages(): string[] {
  const dist = path.resolve("dist");
  const found: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name === "index.html") {
        const rel = path.relative(dist, dir).split(path.sep).join("/");
        found.push(rel ? `/${rel}/` : "/");
      }
    }
  };
  walk(dist);
  found.push("/404.html");
  return found.sort();
}

export const pagesUnderTest =
  process.env.A11Y_FULL === "1" ? allPages() : templatePages;

// Keep runs hermetic: nothing leaves the local preview server.
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route(
      (url) => url.hostname !== "127.0.0.1" && url.hostname !== "localhost",
      (route) => route.abort(),
    );
    await use(page);
  },
});

export { expect };

// True when the page scrolls sideways. One CSS pixel of rounding is allowed.
export async function horizontalOverflow(
  page: import("@playwright/test").Page,
): Promise<number> {
  return page.evaluate(() => {
    const root = document.documentElement;
    return Math.max(0, root.scrollWidth - root.clientWidth - 1);
  });
}
