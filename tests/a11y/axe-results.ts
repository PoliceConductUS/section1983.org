import type AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";

type AxeResults = Awaited<ReturnType<AxeBuilder["analyze"]>>;
type AxeNode = AxeResults["incomplete"][number]["nodes"][number];

// Why axe could not measure an element's contrast, such as "bgImage" or
// "elmPartiallyObscured".
function reasonKey(node: AxeNode): string {
  const data = node.any[0]?.data as { messageKey?: string } | undefined;
  return data?.messageKey ?? "";
}

// True when part of the element is scrolled out of view inside a scrolling
// box, such as a long line in a code block. axe reports that as "partially
// obscured", but nothing is drawn over the text.
async function clippedByScrollBox(page: Page, node: AxeNode) {
  if (node.target.length !== 1) return false;
  return page.evaluate((selector) => {
    const el = document.querySelector(selector);
    if (!el) return false;
    const box = el.getBoundingClientRect();
    for (let a = el.parentElement; a; a = a.parentElement) {
      const style = getComputedStyle(a);
      if (style.overflowX === "visible" && style.overflowY === "visible") {
        continue;
      }
      const clip = a.getBoundingClientRect();
      if (
        box.left < clip.left - 1 ||
        box.right > clip.right + 1 ||
        box.top < clip.top - 1 ||
        box.bottom > clip.bottom + 1
      ) {
        return true;
      }
    }
    return false;
  }, String(node.target[0]));
}

// True for text in an article table. On a phone these tables scroll sideways
// and draw a shadow at each edge with background gradients, which axe cannot
// measure. contrast.spec.ts compares the text with the darkest shadow colour.
async function inScrollShadowTable(page: Page, node: AxeNode) {
  if (node.target.length !== 1) return false;
  return page.evaluate(
    (selector) => !!document.querySelector(selector)?.closest(".prose table"),
    String(node.target[0]),
  );
}

// A contrast result that axe left unmeasured and that still needs a person
// to decide it. Four kinds are settled here instead:
// - Process flowchart labels. They sit in SVG foreignObject elements over
//   SVG shapes, which axe cannot read. contrast.spec.ts measures each label
//   against its shape directly.
// - Content made only of symbols, such as an arrow or a box-drawing line.
//   axe found the colours but cannot tell whether the symbol is text.
// - Text clipped by its own scrolling box.
// - Text over the scroll shadow of an article table.
async function needsDecision(page: Page, node: AxeNode) {
  if (/foreignobject/i.test(node.target.join(" "))) return false;
  const key = reasonKey(node);
  if (key === "nonBmp") return false;
  if (key === "elmPartiallyObscured") {
    return !(await clippedByScrollBox(page, node));
  }
  if (key === "bgGradient") {
    return !(await inScrollShadowTable(page, node));
  }
  return true;
}

// Everything in an axe run that fails a test: each violation, plus each
// contrast result axe could not measure. axe reports text over an image, a
// gradient, or an overlapping element as "incomplete" because it cannot work
// out the background. Those are failed here so a person decides each one.
export async function failures(page: Page, results: AxeResults) {
  const found = results.violations.map((v) => ({ ...v, measured: true }));

  for (const result of results.incomplete) {
    if (result.id !== "color-contrast") continue;
    const nodes: AxeNode[] = [];
    for (const node of result.nodes) {
      if (await needsDecision(page, node)) nodes.push(node);
    }
    if (nodes.length > 0) found.push({ ...result, nodes, measured: false });
  }

  return found.map((v) => ({
    rule: v.measured ? v.id : `${v.id} (could not be measured)`,
    impact: v.impact,
    help: v.help,
    nodes: v.nodes.slice(0, 5).map((n) => ({
      target: n.target.join(" "),
      reason: [...n.any, ...n.all, ...n.none]
        .map((check) => check.message)
        .join(" "),
    })),
    count: v.nodes.length,
  }));
}
