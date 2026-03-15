<script setup lang="ts">
import { computed } from 'vue';
import type { MapWithMetadata } from '@/services/api/maps/types';
import { useFireEffect } from '@/composables/useFireEffect';

const props = withDefaults(
  defineProps<{
    code?: string | undefined;
    map?: MapWithMetadata | undefined;
    btd6Version?: number | undefined;
    burning?: boolean | undefined;
    showPlayButton?: boolean | undefined;
    showName?: boolean | undefined;
    border?: 'none' | 'black' | 'gold';
  }>(),
  { showName: true, border: 'none' }
);

const previewUrl = computed(
  () => props.map?.map_preview_url
    ?? `https://data.ninjakiwi.com/btd6/maps/map/${props.code}/preview`
);

const mapName = computed(() => props.map?.name);

const mapCode = computed(() => props.map?.code ?? props.code);

const playUrl = computed(() =>
  mapCode.value ? `https://join.btd6.com/Map/${mapCode.value}` : undefined
);

const versionLabel = computed(() => {
  if (!props.btd6Version) return '';
  return `v${props.btd6Version / 10}`;
});

const { containerRef: fireContainer } = useFireEffect(() => props.burning);
</script>

<template>
  <div
    class="p-[0.4rem] pb-4 rounded-(--radius-panel) shadow-md hover:shadow-lg relative my-6 mx-0.5 transition-all duration-200"
    :class="[
      border === 'black' ? 'btd6map-black-border' :
      border === 'gold' ? 'btd6map-gold-border' :
      'bg-(--color-secondary) group-hover:bg-(--color-active)'
    ]"
  >
    <p
      v-if="showName && mapName"
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

    <slot name="bottom" />

    <!-- Play button -->
    <div v-if="showPlayButton && playUrl" class="flex justify-center mt-3">
      <a
        :href="playUrl"
        target="_blank"
        class="bg-(--color-highlight) hover:brightness-110 text-(--color-text)! no-underline font-['Luckiest_Guy'] font-border text-2xl px-5 pt-3 pb-2 rounded-(--radius-btn) shadow transition-[filter] duration-200 text-center"
      >
        Play
      </a>
    </div>

    <div
      v-if="map?.is_verified && btd6Version"
      class="absolute left-[-0.7rem] bg-[#b2ebf2] text-black px-1 py-0.5 rounded text-xs z-20"
      :class="mapName ? 'bottom-[-0.5rem]' : 'top-[-0.7rem]'"
    >
      <i class="bi bi-check" />{{ versionLabel }}
    </div>

    <!-- Fire effect -->
    <template v-if="burning">
      <div class="absolute inset-[-3px] rounded-[calc(var(--radius-panel)+3px)] pointer-events-none z-[2] shadow-[0_0_20px_6px_rgba(255,140,0,0.6),0_0_50px_15px_rgba(255,60,0,0.3)]" />
      <div ref="fireContainer" class="absolute inset-0 pointer-events-none z-10 overflow-visible" />
    </template>
  </div>
</template>

<style scoped>
.btd6map-black-border {
  background-color: #080808;
  box-shadow: 0 0 0.4rem 0 #d3d3d3;
}
.btd6map-gold-border {
  background-color: #ddbc00;
  box-shadow: 0 0 0.5rem 0 #e65100;
}
</style>
