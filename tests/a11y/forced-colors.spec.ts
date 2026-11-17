import type { Locator, Page } from "@playwright/test";
import { expect, templatePages, test } from "./pages";

// Runs with forced colors on (Windows High Contrast). The browser replaces
// author colors with system colors and drops backgrounds and box shadows, so
// anything drawn only with those disappears.

const KEY_PAGES = ["/", "/cases/", "/search/", "/process/", "/articles/"];
const TAB_STOPS = 30;

type Clip = { x: number; y: number; width: number; height: number };

// The focused element's box plus a margin, so a ring drawn outside the box
// is inside the screenshot.
async function focusClip(page: Page): Promise<Clip | null> {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body) return null;
    el.scrollIntoView({ block: "center", inline: "nearest" });
    const r = el.getBoundingClientRect();
    const pad = 6;
    const x = Math.max(0, r.x - pad);
    const y = Math.max(0, r.y - pad);
    return {
      x,
      y,
      width: Math.max(1, Math.min(innerWidth - x, r.width + pad * 2)),
      height: Math.max(1, Math.min(innerHeight - y, r.height + pad * 2)),
    };
  });
}

async function distinctColors(target: Locator): Promise<number> {
  const png = (await target.screenshot()).toString("base64");
  return target.page().evaluate(async (data) => {
    const img = new Image();
    img.src = `data:image/png;base64,${data}`;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    const pixels = ctx.getImageData(0, 0, img.width, img.height).data;
    const seen = new Set<number>();
    for (let i = 0; i < pixels.length; i += 4) {
      seen.add((pixels[i] << 16) | (pixels[i + 1] << 8) | pixels[i + 2]);
    }
    return seen.size;
  }, png);
}

test("forced colors are active", async ({ page }) => {
  await page.goto("/");
  expect(
    await page.evaluate(() => matchMedia("(forced-colors: active)").matches),
  ).toBe(true);
});

for (const path of KEY_PAGES) {
  test(`keyboard focus stays visible: ${path}`, async ({ page }) => {
    await page.goto(path);
    const invisible: string[] = [];

    for (let i = 0; i < TAB_STOPS; i++) {
      await page.keyboard.press("Tab");
      const clip = await focusClip(page);
      if (!clip) break;

      const label = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement;
        const text = el.innerText || el.getAttribute("aria-label") || "";
        return `${el.tagName.toLowerCase()} "${text.trim().slice(0, 40)}"`;
      });

      // Same pixels with and without focus means no visible indicator.
      const focused = await page.screenshot({ clip });
      await page.evaluate(() => {
        const el = document.activeElement as HTMLElement;
        el.dataset.a11yProbe = "1";
        el.blur();
      });
      const blurred = await page.screenshot({ clip });
      await page.evaluate(() => {
        const el = document.querySelector<HTMLElement>("[data-a11y-probe]")!;
        delete el.dataset.a11yProbe;
        el.focus({ preventScroll: true });
      });

      if (focused.equals(blurred)) invisible.push(label);
    }

    expect(invisible).toEqual([]);
  });
}

test("icon-only menu button is drawn", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const toggle = page.locator("#mobile-menu-toggle");
  expect(await distinctColors(toggle)).toBeGreaterThan(1);
  await toggle.click();
  expect(await distinctColors(toggle)).toBeGreaterThan(1);
});

for (const path of templatePages) {
  test(`controls keep a visible edge: ${path}`, async ({ page }) => {
    await page.goto(path);
    // Backgrounds are removed, so a field or button needs a border to be
    // seen as a control.
    const edgeless = await page.evaluate(() =>
      [
        ...document.querySelectorAll<HTMLElement>(
          "input, select, textarea, button",
        ),
      ]
        .filter((el) => el.offsetParent !== null)
        .filter((el) => {
          const type = el.getAttribute("type") || "";
          if (["checkbox", "radio", "hidden"].includes(type)) return false;
          // Icon-only buttons are covered by their own test.
          if (el.tagName === "BUTTON" && !el.innerText.trim()) return false;
          const s = getComputedStyle(el);
          const sides = ["Top", "Right", "Bottom", "Left"] as const;
          const bordered = sides.every(
            (side) =>
              s[`border${side}Style`] !== "none" &&
              parseFloat(s[`border${side}Width`]) > 0,
          );
          const outlined =
            s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0;
          return !bordered && !outlined;
        })
        .map(
          (el) =>
            `${el.tagName.toLowerCase()}#${el.id} "${el.innerText.trim().slice(0, 30)}"`,
        ),
    );
    expect(edgeless).toEqual([]);
  });
}
