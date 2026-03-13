<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  code: string;
}>();

const previewUrl = computed(
  () => `https://data.ninjakiwi.com/btd6/maps/map/${props.code}/preview`
);
</script>

<template>
  <div class="bg-(--color-secondary) p-1.5 pb-4 rounded-(--radius-panel) relative shadow transition-colors duration-200">
    <img
      class="w-full h-auto aspect-[3/2] bg-(--color-primary) block rounded-sm"
      :src="previewUrl"
      alt=""
      loading="lazy"
    />
  </div>
</template>
