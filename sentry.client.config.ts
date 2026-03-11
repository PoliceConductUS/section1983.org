import * as Sentry from "@sentry/astro";

const dsn = import.meta.env.PUBLIC_SENTRY_DSN.trim();
const environment = import.meta.env.PUBLIC_SENTRY_ENVIRONMENT.trim();
const isProduction = environment === "production";

Sentry.init({
  beforeSend(event) {
    const url = event.request?.url;

    if (typeof url === "string") {
      const protocol = new URL(url).protocol;

      if (
        protocol === "chrome-extension:" ||
        protocol === "moz-extension:"
      ) {
        return null;
      }
    }

    return event;
  },
  dsn,
  enableLogs: true,
  environment,
  integrations: [
    Sentry.consoleLoggingIntegration({
      levels: ["log", "warn", "error"],
    }),
    Sentry.replayIntegration(),
    Sentry.browserProfilingIntegration(),
  ],
  profileLifecycle: "trace",
  profileSessionSampleRate: isProduction ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: isProduction ? 0.02 : 0.1,
  tracesSampleRate: isProduction ? 0.1 : 1.0,
});
