import * as Sentry from "@sentry/astro";

const dsn = import.meta.env.PUBLIC_SENTRY_DSN.trim();
const environment = import.meta.env.PUBLIC_SENTRY_ENVIRONMENT.trim();
const isProduction = environment === "production";

Sentry.init({
  beforeSend(event) {
    const url = event.request?.url;

    if (typeof url === "string") {
      const protocol = new URL(url).protocol;

      if (protocol === "chrome-extension:" || protocol === "moz-extension:") {
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
    Sentry.feedbackIntegration({
      autoInject: false,
      colorScheme: "light",
      formTitle: "Send feedback",
      isEmailRequired: true,
      isNameRequired: true,
      messagePlaceholder:
        "What went wrong, what was confusing, or what should change?",
      submitButtonLabel: "Send feedback",
      successMessageText: "Thanks. Your feedback has been sent.",
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

const attachFeedbackTriggers = () => {
  const feedback = Sentry.getFeedback();

  if (!feedback) {
    return;
  }

  document
    .querySelectorAll<HTMLElement>("[data-sentry-feedback-trigger]")
    .forEach((trigger) => {
      if (trigger.dataset.sentryFeedbackBound === "true") {
        return;
      }

      feedback.attachTo(trigger, {
        tags: {
          page_path:
            trigger.dataset.sentryFeedbackPage || window.location.pathname,
          surface: trigger.dataset.sentryFeedbackSurface || "site",
        },
      });

      trigger.dataset.sentryFeedbackBound = "true";
    });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", attachFeedbackTriggers);
} else {
  attachFeedbackTriggers();
}
