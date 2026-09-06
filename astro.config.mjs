// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { loadEnv } from "vite";

import sentry from "@sentry/astro";

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
