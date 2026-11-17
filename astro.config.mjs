// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import { satteri } from "@astrojs/markdown-satteri";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { loadEnv } from "vite";

import sentry from "@sentry/astro";

/**
 * @param {unknown} value
 * @param {string} name
 */
function requireNonEmptyString(value, name) {
  if (typeof value !== "string") {
    throw new Error(`${name} must be set.`);
  }

  const trimmed = value.trim();

  if (trimmed.length === 0) {
    throw new Error(`${name} must be a non-empty string.`);
  }

  return trimmed;
}

const mode = process.env.NODE_ENV ?? "development";
const env = loadEnv(mode, process.cwd(), "");
const sentryEnvironment = requireNonEmptyString(
  env.PUBLIC_SENTRY_ENVIRONMENT,
  "PUBLIC_SENTRY_ENVIRONMENT",
);
const sentryDsn = requireNonEmptyString(
  env.PUBLIC_SENTRY_DSN,
  "PUBLIC_SENTRY_DSN",
);

/** @type {Record<string, string>} */
const staticPageSources = {
  "/": "src/pages/index.astro",
  "/about/": "src/pages/about/index.astro",
  "/about/section-1983/": "src/pages/about/section-1983.astro",
  "/accessibility/": "src/pages/accessibility.astro",
  "/articles/": "src/pages/articles/index.astro",
  "/cases/": "src/pages/cases/index.astro",
  "/get-involved/": "src/pages/get-involved.astro",
  "/legal-notice/": "src/pages/legal-notice.astro",
  "/primer/": "src/pages/primer/index.astro",
  "/process/": "src/pages/process/index.astro",
  "/search/": "src/pages/search.astro",
  "/sitemap/": "src/pages/sitemap.astro",
  "/statute-of-limitations/": "src/lib/sol-data.ts",
  "/downloads/": "src/pages/downloads/index.astro",
  "/terms/": "src/pages/terms.astro",
  "/terms-and-concepts/": "src/pages/terms-and-concepts/index.astro",
};

const gitDateCache = new Map();

// Last commit date for a file. CI checkouts give every file the same mtime,
// so git history is the only trustworthy source for sitemap <lastmod>.
/** @param {string} filePath */
function getFileLastModified(filePath) {
  if (gitDateCache.has(filePath)) return gitDateCache.get(filePath);
  let result;
  try {
    const output = execFileSync(
      "git",
      ["log", "-1", "--format=%cI", "--", filePath],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      },
    ).trim();
    if (output) {
      const parsed = new Date(output);
      if (!Number.isNaN(parsed.getTime())) result = parsed;
    }
  } catch {
    result = undefined;
  }
  if (!result && !process.env.CI) {
    try {
      result = fs.statSync(path.join(process.cwd(), filePath)).mtime;
    } catch {
      result = undefined;
    }
  }
  gitDateCache.set(filePath, result);
  return result;
}

/** @param {string} url */
function getSitemapLastModified(url) {
  const pathname = new URL(url).pathname;

  if (pathname in staticPageSources) {
    return getFileLastModified(staticPageSources[pathname]);
  }

  const contentMatch = pathname.match(
    /^\/(articles|cases|primer|process|terms-and-concepts)\/([^/]+)\/$/,
  );
  if (contentMatch) {
    const [, section, slug] = contentMatch;
    if (section === "terms-and-concepts") {
      return getFileLastModified(`terms-and-concepts-content/${slug}.md`);
    }

    return getFileLastModified(`${section}/${slug}.md`);
  }

  return undefined;
}

// Marks sentence-length table cells in Markdown so the stylesheet can let
// them wrap on small screens while short data cells stay on one line.
const LONG_CELL_CHARS = 40;

/** @type {import("satteri").HastPluginDefinition} */
const markLongTableCells = {
  name: "mark-long-table-cells",
  element: {
    filter: ["td"],
    visit(node, ctx) {
      if (ctx.textContent(node).length <= LONG_CELL_CHARS) return;
      const existing = node.properties?.className;
      const classes = Array.isArray(existing)
        ? existing
        : existing
          ? [existing]
          : [];
      ctx.setProperty(node, "className", [...classes, "cell-wrap"]);
    },
  },
};

// Markdown tables scroll sideways on small screens and at high zoom. A scroll
// area must take keyboard focus so it can be scrolled with the arrow keys.
/** @type {import("satteri").HastPluginDefinition} */
const makeTablesFocusable = {
  name: "make-tables-focusable",
  element: {
    filter: ["table"],
    visit(node, ctx) {
      ctx.setProperty(node, "tabIndex", 0);
    },
  },
};

// Markdown task lists render a bare checkbox. Name each one after its list
// item so a screen reader announces what the box is for.
/** @type {import("satteri").HastPluginDefinition} */
const labelTaskListCheckboxes = {
  name: "label-task-list-checkboxes",
  element: {
    filter: ["li"],
    visit(node, ctx) {
      const classes = node.properties?.className;
      if (!Array.isArray(classes) || !classes.includes("task-list-item")) {
        return;
      }
      /**
       * @param {Readonly<import("satteri").HastNode>} parent
       * @returns {Readonly<import("satteri").HastNode> | null}
       */
      const findCheckbox = (parent) => {
        const children = "children" in parent ? parent.children : [];
        for (const child of children) {
          if (child.type !== "element") continue;
          if (child.tagName === "input") return child;
          const nested = child.tagName === "p" ? findCheckbox(child) : null;
          if (nested) return nested;
        }
        return null;
      };
      const checkbox = findCheckbox(node);
      const label = ctx.textContent(node).replace(/\s+/g, " ").trim();
      if (checkbox && label) ctx.setProperty(checkbox, "ariaLabel", label);
    },
  },
};

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL || "https://www.section1983.org",
  integrations: [
    sitemap({
      entryLimit: 45000,
      serialize(item) {
        return {
          ...item,
          lastmod: getSitemapLastModified(item.url) || item.lastmod,
        };
      },
    }),
    sentry(),
  ],
  markdown: {
    processor: satteri({
      hastPlugins: [
        markLongTableCells,
        makeTablesFocusable,
        labelTaskListCheckboxes,
      ],
    }),
  },
  vite: {
    plugins: [tailwindcss()],
    define: {
      "import.meta.env.PUBLIC_SENTRY_DSN": JSON.stringify(sentryDsn),
      "import.meta.env.PUBLIC_SENTRY_ENVIRONMENT":
        JSON.stringify(sentryEnvironment),
    },
    build: {
      sourcemap: "hidden",
    },
  },
});
