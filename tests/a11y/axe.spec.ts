import AxeBuilder from "@axe-core/playwright";
import { failures } from "./axe-results";
import { expect, pagesUnderTest, templatePages, test } from "./pages";

// WCAG 2.2 A and AA, plus axe's best-practice rules (landmarks, heading
// order, one h1), which are what screen-reader navigation depends on.
const TAGS = [
  "wcag2a",
  "wcag2aa",
  "wcag21a",
  "wcag21aa",
  "wcag22aa",
  "best-practice",
];

for (const path of pagesUnderTest) {
  test(`axe: ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    expect(await failures(page, results)).toEqual([]);
  });
}

// Wide content such as tables and charts only scrolls sideways on a narrow
// screen, and a scrolling box must then be reachable by keyboard.
for (const path of templatePages) {
  test(`axe at phone width: ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    expect(await failures(page, results)).toEqual([]);
  });
}

test("axe: mobile menu open", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  expect(await failures(page, results)).toEqual([]);
});
