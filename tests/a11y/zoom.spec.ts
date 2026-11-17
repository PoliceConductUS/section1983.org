import { expect, horizontalOverflow, templatePages, test } from "./pages";

// Browser zoom shrinks the layout viewport. A 1280x720 window zoomed to
// 200% lays out at 640x360 CSS pixels; zoomed to 400% it lays out at 320x180
// (WCAG 1.4.10 Reflow uses 320 CSS pixels wide).
const ZOOM_LEVELS = [
  { label: "200% zoom", width: 640, height: 360 },
  { label: "400% zoom", width: 320, height: 256 },
];

for (const { label, width, height } of ZOOM_LEVELS) {
  test.describe(label, () => {
    test.use({ viewport: { width, height } });

    for (const path of templatePages) {
      test(`reflows without sideways scrolling: ${path}`, async ({ page }) => {
        await page.goto(path);
        expect(await horizontalOverflow(page)).toBe(0);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      });
    }

    test("navigation stays reachable", async ({ page }) => {
      await page.goto("/");
      const toggle = page.locator("#mobile-menu-toggle");
      await expect(toggle).toBeVisible();
      await toggle.click();
      await expect(
        page
          .getByRole("navigation", { name: "Mobile navigation" })
          .getByRole("link", { name: /Cases/ }),
      ).toBeVisible();
      expect(await horizontalOverflow(page)).toBe(0);
    });
  });
}

// WCAG 1.4.4 Resize Text: text-only zoom to 200% (the browser's default font
// size doubled) must not cut content off.
test.describe("200% text size", () => {
  for (const path of templatePages) {
    test(`text scales and stays readable: ${path}`, async ({ page }) => {
      await page.goto(path);
      const before = await page
        .getByRole("heading", { level: 1 })
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));

      await page.addStyleTag({
        content: "html { font-size: 200% !important; }",
      });

      const after = await page
        .getByRole("heading", { level: 1 })
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
      expect(after).toBeGreaterThanOrEqual(before * 1.9);
      expect(await horizontalOverflow(page)).toBe(0);

      // Text inside a box that hides its overflow is text a reader loses.
      const clipped = await page.evaluate(() => {
        const out: string[] = [];
        for (const el of document.querySelectorAll<HTMLElement>("body *")) {
          const style = getComputedStyle(el);
          if (el.offsetParent === null || !el.innerText?.trim()) continue;
          if (el.closest(".sr-only")) continue;
          const hidesX =
            style.overflowX === "hidden" || style.overflowX === "clip";
          const hidesY =
            style.overflowY === "hidden" || style.overflowY === "clip";
          if (
            (hidesX && el.scrollWidth > el.clientWidth + 1) ||
            (hidesY && el.scrollHeight > el.clientHeight + 1)
          ) {
            out.push(
              `${el.tagName.toLowerCase()}.${el.className}`.slice(0, 80),
            );
          }
        }
        return out;
      });
      expect(clipped).toEqual([]);
    });
  }
});
