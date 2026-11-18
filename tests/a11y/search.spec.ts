import { expect, test } from "./pages";

for (const query of ["436 U.S. 658", "75-1914"]) {
  test(`find a case by its citation or docket: ${query}`, async ({ page }) => {
    await page.goto(`/search/?q=${encodeURIComponent(query)}`);
    const result = page.locator(
      '#search-results a[href="/cases/monell-v-dep-t-of-soc-servs/"]',
    );
    await expect(result).toBeVisible();
    await result.click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Monell v. Department of Social Services",
    );
  });
}

test("a typed search survives reload and returning from a result", async ({
  page,
}) => {
  await page.goto("/search/?source=test#search-results");
  await page.locator("#search-input").fill("tased");
  await expect(page.locator("#search-results a").first()).toBeVisible();
  await expect(page).toHaveURL(/source=test&q=tased#search-results$/);

  await page.reload();
  await expect(page.locator("#search-input")).toHaveValue("tased");
  await page.locator("#search-results a").first().click();
  await page.goBack();
  await expect(page.locator("#search-input")).toHaveValue("tased");
  await expect(page.locator("#search-results a").first()).toBeVisible();

  await page.locator("#search-input").fill("");
  await expect(page).toHaveURL(/\/search\/\?source=test#search-results$/);
  await expect(page.locator("#search-results a")).toHaveCount(0);
});

test("typing during the initial search uses one index request and the latest query", async ({
  page,
}) => {
  let releaseIndex: () => void = () => {};
  const ready = new Promise<void>((resolve) => {
    releaseIndex = resolve;
  });
  let requests = 0;
  await page.route("**/search.json", async (route) => {
    requests++;
    const response = await route.fetch();
    await ready;
    await route.fulfill({ response });
  });
  await page.clock.install();
  await page.goto("/search/?q=tased");
  await expect.poll(() => requests).toBe(1);
  await page.locator("#search-input").fill("monell");
  await page.clock.runFor(200);
  releaseIndex();

  await expect(page.locator("#search-results a").first()).toContainText(
    "Monell",
  );
  await expect(page.locator("#search-results")).toHaveAttribute(
    "aria-busy",
    "false",
  );
  expect(requests).toBe(1);
});

test("search retries after the index request fails", async ({ page }) => {
  let requests = 0;
  await page.route("**/search.json", async (route) => {
    requests++;
    if (requests === 1) await route.abort();
    else await route.continue();
  });
  await page.goto("/search/?q=tased");
  await expect(page.locator("#search-status")).toContainText("unavailable");
  await page.locator("#search-input").fill("monell");
  await expect(page.locator("#search-results a").first()).toContainText(
    "Monell",
  );
  expect(requests).toBe(2);
});
