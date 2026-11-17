import AxeBuilder from "@axe-core/playwright";
import { expect, pagesUnderTest, test } from "./pages";

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

function summarize(
  violations: Awaited<ReturnType<AxeBuilder["analyze"]>>["violations"],
) {
  return violations.map((v) => ({
    rule: v.id,
    impact: v.impact,
    help: v.help,
    nodes: v.nodes.slice(0, 5).map((n) => n.target.join(" ")),
    count: v.nodes.length,
  }));
}

for (const path of pagesUnderTest) {
  test(`axe: ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    expect(summarize(results.violations)).toEqual([]);
  });
}

test("axe: mobile menu open", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  expect(summarize(results.violations)).toEqual([]);
});
