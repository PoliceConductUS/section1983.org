import { readAnalyticsChoice, consentState } from "./analytics-consent.js";

const MEASUREMENT_ID = import.meta.env.PUBLIC_GA_MEASUREMENT_ID?.trim();
const ATTRIBUTION_PARAMETERS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_id",
  "utm_content",
  "utm_term",
  "gclid",
  "dclid",
  "gbraid",
  "wbraid",
]);
const URL_PARAMETERS = new Set([
  "page_location",
  "page_referrer",
  "destination_url",
  "page_path",
  "href_path",
  "prefill_key",
]);

const isProduction = () =>
  window.location.protocol === "https:" &&
  ["section1983.org", "www.section1983.org"].includes(window.location.host);

const sanitizeUrl = (value) => {
  if (!value) return "";
  try {
    const url = new URL(value, window.location.origin);
    if (url.protocol !== "https:" && url.protocol !== "http:") return "";
    url.username = "";
    url.password = "";
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) {
      if (!ATTRIBUTION_PARAMETERS.has(key)) url.searchParams.delete(key);
    }
    return url.href;
  } catch {
    return "";
  }
};

const pageContext = () => ({
  page_location: sanitizeUrl(window.location.href),
  page_path: window.location.pathname,
  page_referrer: sanitizeUrl(document.referrer),
});

export const trackAnalytics = (eventName, params = {}) => {
  if (!isProduction() || !eventName || typeof window.gtag !== "function")
    return;
  const payload = { ...pageContext(), ...params };
  for (const key of Object.keys(payload)) {
    if (URL_PARAMETERS.has(key)) {
      const url = sanitizeUrl(payload[key]);
      payload[key] =
        url && (key.endsWith("_path") || key === "prefill_key")
          ? new URL(url).pathname
          : url;
    }
    const value = payload[key];
    if (
      value === undefined ||
      value === null ||
      value === "" ||
      Number.isNaN(value)
    ) {
      delete payload[key];
    }
  }
  window.gtag("event", eventName, payload);
};

export const initializeAnalytics = () => {
  window.__IPC_ANALYTICS__ = { track: trackAnalytics };
  if (!MEASUREMENT_ID || !isProduction()) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    if (isProduction()) window.dataLayer.push(arguments);
  };
  window.gtag("consent", "default", consentState(readAnalyticsChoice()));
  const context = pageContext();
  window.gtag("js", new Date());
  window.gtag("set", context);
  window.gtag("config", MEASUREMENT_ID, {
    ...context,
    page_title: document.title,
    send_page_view: false,
    allow_ad_personalization_signals: false,
    allow_google_signals: false,
  });
  trackAnalytics("page_view");
  const script = document.createElement("script");
  script.async = true;
  script.referrerPolicy = "origin";
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);
};
