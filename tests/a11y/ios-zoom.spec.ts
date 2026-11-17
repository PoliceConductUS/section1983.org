import { expect, horizontalOverflow, templatePages, test } from "./pages";

// Runs in WebKit at iPhone size. Playwright cannot perform a real pinch, and
// it does not reproduce Safari's zoom-on-focus, so these tests check the
// conditions that cause or block zoom on iOS. The pinch itself is a manual
// check in docs/accessibility-testing.md.

test("viewport allows pinch zoom", async ({ page }) => {
  await page.goto("/");
  const content =
    (await page.locator('meta[name="viewport"]').getAttribute("content")) || "";
  const settings = Object.fromEntries(
    content.split(",").map((part) => {
      const [key, value = ""] = part.split("=");
      return [key.trim().toLowerCase(), value.trim().toLowerCase()];
    }),
  );
  expect(settings["width"]).toBe("device-width");
  expect(["no", "0"]).not.toContain(settings["user-scalable"]);
  if (settings["maximum-scale"] !== undefined) {
    expect(Number(settings["maximum-scale"])).toBeGreaterThanOrEqual(5);
  }
});

for (const path of templatePages) {
  test(`iOS zoom conditions: ${path}`, async ({ page }) => {
    await page.goto(path);

    // Safari zooms the page when a focused field's text is under 16px.
    const smallFields = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>("input, select, textarea")]
        .filter((el) => {
          const type = el.getAttribute("type") || "";
          return (
            el.offsetParent !== null &&
            !["checkbox", "radio", "hidden", "button", "submit"].includes(type)
          );
        })
        .filter((el) => parseFloat(getComputedStyle(el).fontSize) < 16)
        .map((el) => `${el.tagName.toLowerCase()}#${el.id}`),
    );
    expect(smallFields).toEqual([]);

    // Nothing may switch off the user's text scaling or pinch gesture.
    const blockers = await page.evaluate(() => {
      const out: string[] = [];
      for (const el of [document.documentElement, document.body]) {
        const style = getComputedStyle(el);
        const adjust = style.getPropertyValue("-webkit-text-size-adjust");
        if (adjust === "none") out.push(`${el.tagName}: text-size-adjust none`);
        if (!["auto", "manipulation"].includes(style.touchAction)) {
          out.push(`${el.tagName}: touch-action ${style.touchAction}`);
        }
      }
      return out;
    });
    expect(blockers).toEqual([]);

    expect(await horizontalOverflow(page)).toBe(0);
  });
}

test.describe("landscape", () => {
  test.use({ viewport: { width: 664, height: 390 } });

  for (const path of [
    "/",
    "/cases/",
    "/statute-of-limitations/",
    "/process/",
  ]) {
    test(`no sideways scrolling: ${path}`, async ({ page }) => {
      await page.goto(path);
      expect(await horizontalOverflow(page)).toBe(0);
    });
  }
});
