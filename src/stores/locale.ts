import { ref } from "vue";
import { defineStore } from "pinia";
import i18n, { LOCALES, DEFAULT_LOCALE_ID } from "@/i18n";

const STORAGE_KEY = "locale_id";

export const useLocaleStore = defineStore("locale", () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  const localeId = ref(
    LOCALES.some((l) => l.id === saved) ? saved! : DEFAULT_LOCALE_ID,
  );

  function apply() {
    i18n.global.locale.value = localeId.value;
  }

  // Apply on init
  apply();

  function setLocale(id: string) {
    if (!LOCALES.some((l) => l.id === id)) return;
    localeId.value = id;
    localStorage.setItem(STORAGE_KEY, id);
    apply();
  }

  return { localeId, setLocale };
});
