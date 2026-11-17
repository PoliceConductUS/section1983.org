import { expect, templatePages, test } from "./pages";

// These tests read the accessibility tree, which is what VoiceOver, NVDA,
// and JAWS read. They do not replace listening to a real screen reader;
// see docs/accessibility-testing.md for the manual checks.

for (const path of templatePages) {
  test(`page structure: ${path}`, async ({ page }) => {
    await page.goto(path);

    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    expect((await page.title()).trim().length).toBeGreaterThan(0);

    // One of each top-level landmark, and one page heading.
    await expect(page.getByRole("banner")).toHaveCount(1);
    await expect(page.getByRole("main")).toHaveCount(1);
    await expect(page.getByRole("contentinfo")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);

    // Navigation landmarks need distinct names so a landmark list is usable.
    const navNames = await page
      .getByRole("navigation")
      .evaluateAll((navs) =>
        navs
          .filter((nav) => (nav as HTMLElement).offsetParent !== null)
          .map(
            (nav) =>
              nav.getAttribute("aria-label") ||
              document.getElementById(nav.getAttribute("aria-labelledby") || "")
                ?.textContent ||
              "",
          ),
      );
    expect(navNames.every((name) => name.trim().length > 0)).toBe(true);
    expect(new Set(navNames).size).toBe(navNames.length);
  });
}

test("page titles are distinct", async ({ page }) => {
  const titles = new Map<string, string>();
  for (const path of templatePages.filter((p) => p !== "/404.html")) {
    await page.goto(path);
    const title = await page.title();
    expect(titles.get(title), `${path} shares its title`).toBeUndefined();
    titles.set(title, path);
  }
});

test("skip link is the first stop and moves focus into main", async ({
  page,
}) => {
  await page.goto("/articles/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to main content" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();

  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  const insideMain = await page.evaluate(
    () => !!document.activeElement?.closest("main"),
  );
  expect(insideMain).toBe(true);
});

test("mobile menu reports its state and closes on Escape", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const toggle = page.locator("#mobile-menu-toggle");
  const menu = page.getByRole("navigation", { name: "Mobile navigation" });

  await expect(toggle).toHaveAccessibleName("Open menu");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(menu).toHaveCount(0);

  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAccessibleName("Close menu");
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("link", { name: /The Process/ })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(menu).toHaveCount(0);
  await expect(toggle).toBeFocused();
});

test("every link and button has an accessible name", async ({ page }) => {
  for (const path of templatePages) {
    await page.goto(path);
    for (const role of ["link", "button"] as const) {
      const unnamed = await page.getByRole(role, { name: /^\s*$/ }).count();
      expect(unnamed, `${path} has an unnamed ${role}`).toBe(0);
    }
  }
});

test("search field is labelled and results are announced", async ({ page }) => {
  await page.goto("/search/");
  const box = page.getByRole("searchbox").or(page.getByRole("textbox"));
  await expect(box.first()).toBeVisible();
  const name = await box.first().evaluate((el) => {
    const input = el as HTMLInputElement;
    return (
      input.getAttribute("aria-label") ||
      input.labels?.[0]?.textContent ||
      ""
    ).trim();
  });
  expect(name.length).toBeGreaterThan(0);
  await expect(
    page.locator("[aria-live], [role=status]").first(),
  ).toBeAttached();
});
