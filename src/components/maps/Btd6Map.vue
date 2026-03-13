<script setup lang="ts">
import { computed } from 'vue';
import type { MapWithMetadata } from '@/services/api/maps/types';

const props = defineProps<{
  code?: string;
  map?: MapWithMetadata;
  btd6Version?: number;
}>();

const previewUrl = computed(
  () => props.map?.map_preview_url
    ?? `https://data.ninjakiwi.com/btd6/maps/map/${props.code}/preview`
);

const mapName = computed(() => props.map?.name);

const versionLabel = computed(() => {
  if (!props.btd6Version) return '';
  return `v${props.btd6Version / 10}`;
});
</script>

<template>
  <div class="bg-(--color-secondary) p-[0.4rem] pb-4 rounded-(--radius-panel) shadow-md hover:shadow-lg relative my-6 mx-0.5 transition-all duration-200 group-hover:bg-(--color-active)">
    <p
      v-if="mapName"
      class="absolute top-[-0.7rem] left-[-0.1rem] w-full text-center font-['Luckiest_Guy'] font-border text-base md:text-2xl break-words z-10"
    >
      {{ mapName }}
    </p>

    <!-- Badge slot — absolutely positioned top-left over the image -->
    <slot name="badge" />

    <img
      class="w-full h-auto aspect-[3/2] bg-(--color-primary) block rounded-sm"
      :src="previewUrl"
      alt=""
      loading="lazy"
    />
    <div
      v-if="map?.is_verified && btd6Version"
      class="absolute left-[-0.7rem] bg-[#b2ebf2] text-black px-1 py-0.5 rounded text-xs"
      :class="mapName ? 'bottom-[-0.5rem]' : 'top-[-0.7rem]'"
    >
      <i class="bi bi-check" />{{ versionLabel }}
    </div>
  </div>
</template>
