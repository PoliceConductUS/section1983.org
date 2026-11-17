import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { failures } from "./axe-results";
import { expect, templatePages, test } from "./pages";

// axe measures a page as it loads. These tests first put the page into its
// pointer-hover and keyboard-focus states, so a text colour or background
// that only appears in those states is measured too.

const INTERACTIVE =
  "a[href], button, input, select, textarea, summary, [tabindex]";
const INSIDE_INTERACTIVE = `:is(${INTERACTIVE}), :is(${INTERACTIVE}) *`;

type Step = { selector: string; pseudo: string[] };

const STATES: { name: string; steps: Step[] }[] = [
  {
    // A link or control under the pointer, along with whatever contains it.
    name: "pointer over every element",
    steps: [{ selector: "body, body *", pseudo: ["hover"] }],
  },
  {
    // A card or table row under the pointer while the link inside it is not.
    name: "pointer over containers only",
    steps: [
      {
        selector: `body, body *:not(${INSIDE_INTERACTIVE})`,
        pseudo: ["hover"],
      },
    ],
  },
  {
    name: "keyboard focus",
    steps: [
      {
        selector: INTERACTIVE,
        pseudo: ["focus", "focus-visible", "focus-within"],
      },
      {
        selector: `body, body *:not(:is(${INTERACTIVE}))`,
        pseudo: ["focus-within"],
      },
    ],
  },
];

// Holds the matched elements in the given pseudo-class states, the way the
// browser's developer tools do, until the page is closed.
async function forceState(page: Page, steps: Step[]) {
  // Colour transitions would be measured part-way through.
  await page.addStyleTag({
    content:
      "*, *::before, *::after { transition: none !important; animation: none !important; }",
  });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("DOM.enable");
  await cdp.send("CSS.enable");
  const { root } = await cdp.send("DOM.getDocument");
  for (const step of steps) {
    const { nodeIds } = await cdp.send("DOM.querySelectorAll", {
      nodeId: root.nodeId,
      selector: step.selector,
    });
    await Promise.all(
      nodeIds.map((nodeId) =>
        cdp.send("CSS.forcePseudoState", {
          nodeId,
          forcedPseudoClasses: step.pseudo,
        }),
      ),
    );
  }
}

// axe cannot read the flowchart: each label is HTML inside an SVG
// foreignObject, drawn over an SVG shape. This measures the label's text
// colour against the fill of the shape behind it.
test("process flowchart labels contrast with their shapes", async ({
  page,
}) => {
  await page.goto("/process/");
  const labels = await page.evaluate(() => {
    const channels = (color: string) => {
      const parts = color.match(/[\d.]+/g)?.map(Number) ?? [];
      // Anything other than an opaque rgb() colour cannot be compared.
      if (parts.length < 3 || (parts.length > 3 && parts[3] < 1)) return null;
      return parts.slice(0, 3);
    };
    const luminance = (rgb: number[]) => {
      const [r, g, b] = rgb.map((v) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    return [...document.querySelectorAll("svg g.node")].map((node) => {
      const shape = node.querySelector(".label-container");
      const label = node.querySelector(".nodeLabel p, .nodeLabel");
      const text = (label?.textContent ?? "").trim().slice(0, 40);
      const fill = shape && channels(getComputedStyle(shape).fill);
      const color = label && channels(getComputedStyle(label).color);
      if (!fill || !color) return { text, ratio: 0 };
      const [light, dark] = [luminance(fill), luminance(color)].sort(
        (a, b) => b - a,
      );
      return { text, ratio: (light + 0.05) / (dark + 0.05) };
    });
  });

  expect(labels.length).toBeGreaterThan(0);
  expect(labels.filter((label) => label.ratio < 4.5)).toEqual([]);
});

// On a phone, wide article tables scroll sideways and draw a shadow at each
// edge with background gradients. axe cannot measure text over a gradient, so
// this compares each text colour in the table with every colour the gradient
// can put behind it, including the darkest part of the shadow.
test("table scroll shadows keep text readable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/about/section-1983/");
  const cells = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    // Lets the browser turn any CSS colour into red, green, blue and alpha.
    const rgba = (color: string) => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
      return { rgb: [r, g, b], alpha: a / 255 };
    };
    const luminance = (rgb: number[]) => {
      const [r, g, b] = rgb.map((v) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const contrast = (a: number[], b: number[]) => {
      const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
      return (light + 0.05) / (dark + 0.05);
    };
    // The nearest fully opaque background colour from `from` up to `stop`.
    const opaqueBackground = (from: Element, stop: Element | null) => {
      for (
        let el: Element | null = from;
        el && el !== stop;
        el = el.parentElement
      ) {
        const color = rgba(getComputedStyle(el).backgroundColor);
        if (color.alpha === 1) return color.rgb;
      }
      return null;
    };

    return [...document.querySelectorAll(".prose table")].flatMap((table) => {
      const behind = opaqueBackground(table, null) ?? [255, 255, 255];
      const stops =
        getComputedStyle(table).backgroundImage.match(/[a-z]+\([^()]*\)/g) ??
        [];
      const shadows = stops.map((stop) => {
        const color = rgba(stop);
        return color.rgb.map(
          (v, i) => v * color.alpha + behind[i] * (1 - color.alpha),
        );
      });
      return [...table.querySelectorAll("th, td, th *, td *")]
        .filter((el) =>
          [...el.childNodes].some(
            (n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim(),
          ),
        )
        .map((el) => {
          // A cell with its own solid background hides the shadow.
          const own = opaqueBackground(el, table);
          const backgrounds = own ? [own] : [behind, ...shadows];
          const color = rgba(getComputedStyle(el).color).rgb;
          return {
            text: (el.textContent ?? "").trim().slice(0, 40),
            shadowColors: shadows.length,
            ratio: Math.min(...backgrounds.map((bg) => contrast(color, bg))),
          };
        });
    });
  });

  expect(cells.length).toBeGreaterThan(0);
  // Confirms the shadow gradients were present to be measured.
  expect(cells.every((cell) => cell.shadowColors > 0)).toBe(true);
  expect(cells.filter((cell) => cell.ratio < 4.5)).toEqual([]);
});

for (const state of STATES) {
  for (const path of templatePages) {
    test(`contrast with ${state.name}: ${path}`, async ({ page }) => {
      await page.goto(path);
      await forceState(page, state.steps);
      const results = await new AxeBuilder({ page })
        .withRules(["color-contrast"])
        .analyze();
      expect(await failures(page, results)).toEqual([]);
    });
  }
}
