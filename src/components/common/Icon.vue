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
    :alt="alt ?? t('icon')"
    :src="src"
    class="inline-block h-[1em] w-[1em] object-cover align-middle scale-150"
  />
</template>

<i18n lang="json">
{
  "en": {
    "icon": "Icon"
  }
}
</i18n>
