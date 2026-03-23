// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import fs from "node:fs";
import path from "node:path";
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
  "/terms/": "src/pages/terms.astro",
};

function getFileLastModified(filePath) {
  try {
    return fs.statSync(path.join(process.cwd(), filePath)).mtime;
  } catch {
    return undefined;
  }
}

function getSitemapLastModified(url) {
  const pathname = new URL(url).pathname;

  if (pathname in staticPageSources) {
    return getFileLastModified(staticPageSources[pathname]);
  }

  const contentMatch = pathname.match(
    /^\/(articles|cases|primer|process)\/([^/]+)\/$/,
  );
  if (contentMatch) {
    const [, section, slug] = contentMatch;
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
