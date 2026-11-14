const CHOICE_KEY = "ipc-analytics-consent-v1";
const validChoice = (value) => value === "granted" || value === "denied";

export function createConsentPreferences(getStorage, subscribeToStorage) {
  const read = () => {
    try {
      const saved = getStorage().getItem(CHOICE_KEY);
      if (validChoice(saved))
        return { analytics: saved, advertising: "denied" };
      const choices = JSON.parse(saved);
      return choices &&
        validChoice(choices.analytics) &&
        validChoice(choices.advertising)
        ? choices
        : null;
    } catch {
      return null;
    }
  };
  return {
    read,
    save(choices) {
      getStorage().setItem(CHOICE_KEY, JSON.stringify(choices));
    },
    subscribe(listener) {
      subscribeToStorage((event) => {
        if (event.key === CHOICE_KEY || event.key === null) listener(read());
      });
    },
  };
}

export const consentPreferences = createConsentPreferences(
  () => window.localStorage,
  (listener) => window.addEventListener("storage", listener),
);
