import { expect, test } from "./pages";

test("case filter URLs render markup as text", async ({ page }) => {
  const tag =
    '<img src=x onerror="document.documentElement.dataset.injected=1">';
  await page.goto(`/cases/?tags=${encodeURIComponent(tag)}`);

  const filters = page.locator("#active-tags-list");
  await expect(filters.getByRole("button")).toHaveText(`${tag} ✕`);
  await expect(filters.locator("img")).toHaveCount(0);
  await expect(page.locator("html")).not.toHaveAttribute("data-injected");

  await filters.getByRole("button").click();
  await expect(page.locator("#active-filters")).toBeHidden();
  await expect(page.locator(".case-card:visible").first()).toBeVisible();
});

test("shared case filters retain their selections", async ({ page }) => {
  await page.goto("/cases/?tags=texas%2Cqi-defeated");

  await expect(page.locator('[data-tag="texas"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator('[data-tag="qi-defeated"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  const cards = page.locator(".case-card:visible");
  expect(await cards.count()).toBeGreaterThan(0);
  for (const card of await cards.all()) {
    await expect(card).toHaveAttribute("data-tags", /(?:^|,)texas(?:,|$)/);
    await expect(card).toHaveAttribute(
      "data-tags",
      /(?:^|,)qi-defeated(?:,|$)/,
    );
  }

  await page.getByRole("button", { name: "clear all", exact: true }).click();
  await expect(page).toHaveURL(/\/cases\/$/);
  await expect(page.locator('[data-tag="all"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});
