// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

import sentry from "@sentry/astro";

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL || "https://www.section1983.org",
  integrations: [sitemap({
    entryLimit: 45000,
  }), sentry()],
  vite: {
    plugins: [tailwindcss()],
    build: {
      sourcemap: "hidden",
    },
  },
});