export const advertisingSettings = (choices) => ({
  allow_ad_personalization_signals: choices?.advertising === "granted",
  allow_google_signals: choices?.advertising === "granted",
});

export const consentState = (choices) => ({
  analytics_storage: choices?.analytics === "granted" ? "granted" : "denied",
  ad_storage: choices?.advertising === "granted" ? "granted" : "denied",
  ad_user_data: choices?.advertising === "granted" ? "granted" : "denied",
  ad_personalization: choices?.advertising === "granted" ? "granted" : "denied",
});

export function clearGoogleConsentCookies(choices, hostname, cookieJar) {
  const host = hostname.split(".");
  const domains = ["", ...host.map((_, index) => host.slice(index).join("."))];
  for (const cookie of cookieJar.cookie.split(";")) {
    const name = cookie.trim().split("=")[0];
    const analyticsCookie = name === "_ga" || name.startsWith("_ga_");
    const advertisingCookie =
      name.startsWith("_gcl_") || name === "_gac" || name.startsWith("_gac_");
    const removeAnalytics = choices?.analytics !== "granted" && analyticsCookie;
    const removeAdvertising =
      choices?.advertising !== "granted" && advertisingCookie;
    if (!removeAnalytics && !removeAdvertising) continue;
    for (const domain of domains) {
      cookieJar.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax${domain ? `; Domain=${domain}` : ""}`;
    }
  }
}

export function applyGoogleConsent(choices, environment) {
  if (typeof environment.gtag === "function") {
    environment.gtag("set", advertisingSettings(choices));
    environment.gtag("consent", "update", consentState(choices));
  }
  clearGoogleConsentCookies(
    choices,
    environment.hostname,
    environment.document,
  );
}
