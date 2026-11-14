export function initializeConsentControls(root, preferences, applyConsent) {
  const panel = root.querySelector("[data-analytics-consent]");
  const settings = root.querySelector("[data-privacy-settings]");
  const status = panel.querySelector("[data-consent-status]");
  const analytics = panel.querySelector("[data-analytics-enabled]");
  const advertising = panel.querySelector("[data-advertising-enabled]");
  const show = () => {
    panel.hidden = false;
    if (!panel.open) panel.showModal();
  };
  const hide = () => {
    panel.close();
    panel.hidden = true;
  };
  const render = (choices) => {
    analytics.checked = choices?.analytics === "granted";
    advertising.checked = choices?.advertising === "granted";
    status.textContent = `Analytics cookies: ${analytics.checked ? "allowed" : "declined"}. Advertising: ${advertising.checked ? "allowed" : "declined"}.`;
  };
  const initialChoices = preferences.read();
  settings.hidden = false;
  render(initialChoices);
  if (initialChoices === null) show();
  panel.addEventListener("cancel", () => {
    panel.hidden = true;
  });
  settings.addEventListener("click", () => {
    render(preferences.read());
    show();
  });
  const save = (choices) => {
    applyConsent(choices);
    render(choices);
    try {
      preferences.save(choices);
      hide();
      settings.focus();
    } catch {
      status.textContent =
        "Your choice applies to this page. Your browser could not save it for your next visit.";
    }
  };
  panel.querySelectorAll("[data-analytics-choice]").forEach((button) => {
    button.addEventListener("click", () =>
      save({
        analytics: button.dataset.analyticsChoice,
        advertising: button.dataset.analyticsChoice,
      }),
    );
  });
  panel.querySelector("[data-analytics-save]").addEventListener("click", () =>
    save({
      analytics: analytics.checked ? "granted" : "denied",
      advertising: advertising.checked ? "granted" : "denied",
    }),
  );
  preferences.subscribe((choices) => {
    applyConsent(choices);
    if (choices === null) show();
    else hide();
    render(choices);
  });
}
