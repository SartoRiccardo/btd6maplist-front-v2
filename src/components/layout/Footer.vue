<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { RouterLink } from "vue-router";

const { t } = useI18n({ inheritLocale: true });


const currentYear = new Date().getFullYear();
const copyrightYears = currentYear > 2024 ? `2024 - ${currentYear}` : "2024";
</script>

<template>
  <footer class="text-center text-xs px-3 mt-auto pt-12">
    <hr class="w-[70%] mx-auto border-(--color-secondary) mb-4" />
    <p class="mb-2">
      <RouterLink to="/maps/maplist/map-rules">{{ t("mapRules") }}</RouterLink>
      {{ " | " }}
      <RouterLink to="/maps/maplist/completion-rules">{{
        t("completionRules")
      }}</RouterLink>
      {{ " | " }}
      <a href="https://ko-fi.com/sarto" target="_blank">
        <i class="bi bi-cup-hot-fill" />&nbsp;{{ t("donate") }}
      </a>
    </p>
    <p class="pb-6">&copy; {{ t("copyright", { years: copyrightYears }) }}</p>
  </footer>
</template>

<i18n lang="json">
{
  "en": {
    "mapRules": "Map Submission Rules",
    "completionRules": "Completion Submission Rules",
    "donate": "Donate",
    "copyright": "© {years} Sarto"
  }
}
</i18n>
