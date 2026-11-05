<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n({ inheritLocale: true });

defineProps<{
  src: string;
  alt?: string;
}>();
</script>

<template>
  <img
    :alt="alt ?? t('badge')"
    :src="src"
    class="inline-block h-[1.5em] w-[1.5em] rounded-full border-[0.15em] border-(--color-highlight) bg-(--color-primary) object-cover align-middle"
  />
</template>

<i18n lang="json">
{
  "en": {
    "badge": "Badge"
  }
}
</i18n>
