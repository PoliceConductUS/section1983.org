import * as Sentry from "@sentry/astro";

const dsn = import.meta.env.PUBLIC_SENTRY_DSN.trim();
const environment = import.meta.env.PUBLIC_SENTRY_ENVIRONMENT.trim();

Sentry.init({
  dsn,
  environment,
  tracesSampleRate: 0,
  enableLogs: true,
  integrations: [
    Sentry.consoleLoggingIntegration({
      levels: ["log", "warn", "error"],
    }),
  ],
});
