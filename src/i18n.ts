import { createI18n } from "vue-i18n";
import en from "./locales/en.json";

/**
 * Global messages: only truly shared strings ("common" stuff like ok/cancel).
 * Feature strings live IN the component itself via <i18n lang="json"> blocks —
 * do not add them here.
 */
export interface Locale {
  id: string;
  /** Name shown in the language picker (endonym, e.g. "Français" for fr). */
  name: string;
}

export const LOCALES: Locale[] = [{ id: "en", name: "English" }];

export const DEFAULT_LOCALE_ID = "en";

export const SUPPORTED_LOCALES = LOCALES.map((l) => l.id) as unknown as string[];

export default createI18n<false>({
  legacy: false,
  locale: DEFAULT_LOCALE_ID,
  fallbackLocale: DEFAULT_LOCALE_ID,
  messages: { en },
});
