<script setup lang="ts">
import type { GhostMap } from '@/services/api/maps/types';

defineProps<{
  map: GhostMap;
}>();
</script>

<template>
  <div class="bg-(--color-secondary) p-[0.4rem] pb-4 rounded-(--radius-panel) shadow-md relative my-6 mx-0.5">
    <p class="absolute top-[-0.7rem] left-[-0.1rem] w-full text-center font-['Luckiest_Guy'] font-border text-base md:text-2xl break-words z-10">
      {{ map.retro_map.name }}
    </p>

    <img
      class="w-full h-auto aspect-[3/2] bg-(--color-primary) block rounded-sm"
      :src="map.retro_map.preview_url"
      alt=""
      loading="lazy"
    />
  </div>
</template>
