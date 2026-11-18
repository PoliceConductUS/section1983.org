import { expect, test } from "./pages";

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
