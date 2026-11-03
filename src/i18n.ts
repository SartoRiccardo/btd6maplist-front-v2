import { createI18n } from "vue-i18n";
import en from "./locales/en.json";

/**
 * Global messages: only truly shared strings ("common" stuff like ok/cancel).
 * Feature strings live IN the component itself via <i18n lang="json"> blocks —
 * do not add them here.
 */
export const SUPPORTED_LOCALES = ["en"] as const;

export default createI18n<false>({
  legacy: false,
  locale: "en",
  fallbackLocale: "en",
  messages: { en },
});
