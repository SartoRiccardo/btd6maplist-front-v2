import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { themes, DEFAULT_THEME_ID, type Theme } from '@/constants/themes';

const STORAGE_KEY = 'theme_id';

function applyTheme(theme: Theme) {
  const style = document.documentElement.style;
  style.setProperty('--color-primary', theme.colors.primary);
  style.setProperty('--color-secondary', theme.colors.secondary);
  style.setProperty('--color-highlight', theme.colors.highlight);
  style.setProperty('--color-active', theme.colors.active);
  style.setProperty('--color-contrast', theme.colors.contrast);
  style.setProperty('--color-text', theme.colors.text);
  style.setProperty('--color-text-muted', theme.colors.textMuted);
  style.setProperty('--color-danger', theme.colors.danger);
  style.setProperty('--color-text-active', theme.colors.textActive);
  style.setProperty('--color-font-border', theme.colors.fontBorder);
  style.setProperty('--color-font-border-active', theme.colors.fontBorderActive);
}

export const useThemeStore = defineStore('theme', () => {
  const savedId = localStorage.getItem(STORAGE_KEY);
  const themeId = ref(
    themes.some((t) => t.id === savedId) ? savedId! : DEFAULT_THEME_ID,
  );

  const activeTheme = computed(
    () => themes.find((t) => t.id === themeId.value)!,
  );

  // Apply on init
  applyTheme(activeTheme.value);

  function setTheme(id: string) {
    const theme = themes.find((t) => t.id === id);
    if (!theme) return;
    themeId.value = id;
    localStorage.setItem(STORAGE_KEY, id);
    applyTheme(theme);
  }

  return { themeId, activeTheme, setTheme };
});
