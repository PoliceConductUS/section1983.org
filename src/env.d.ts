/// <reference path="../.astro/types.d.ts" />

// Google's tag function. src/lib/client/analytics.js defines it once analytics
// loads, so it is missing until then.
interface Window {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
}
