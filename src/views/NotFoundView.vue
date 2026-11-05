<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n({ inheritLocale: true });
</script>

<template>
  <div class="text-center">
    <img
      src="/images/misc/defeat.webp"
      :alt="t('defeat')"
      class="mx-auto max-w-[30rem]"
    />

    <hr class="border-(--color-secondary) max-w-[35rem] my-0 mx-auto" />

    <h1 class="font-['Luckiest_Guy'] text-4xl mt-6">
      {{ t("pageNotFound") }}
    </h1>

    <div class="mt-2">
      <router-link to="/" class="no-underline text-(--color-text)">
        {{ t("goHome") }}
      </router-link>
    </div>
  </div>
</template>

<i18n lang="json">
{
  "en": {
    "defeat": "Defeat",
    "pageNotFound": "Page not found!",
    "goHome": "« Go Home"
  }
}
</i18n>
