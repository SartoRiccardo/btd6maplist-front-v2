<script setup lang="ts">
import type { GhostMap } from '@/services/api/maps/types';

defineProps<{
  map: GhostMap;
}>();
</script>

<template>
  <RouterLink
    :to="`/map/submit?on=11&remake_of=${map.retro_map.id}`"
    class="group no-underline! text-(--color-text)!"
  >
    <div class="bg-(--color-secondary) p-[0.4rem] pb-4 rounded-(--radius-panel) shadow-md relative my-6 mx-0.5 transition-all duration-200 group-hover:bg-(--color-active)">
      <p class="absolute top-[-0.7rem] left-[-0.1rem] w-full text-center font-['Luckiest_Guy'] font-border text-base md:text-2xl break-words z-10">
        {{ map.retro_map.name }}
      </p>

      <img
        class="w-full h-auto aspect-[3/2] bg-(--color-primary) block rounded-sm opacity-50 brightness-30 transition-all duration-200 group-hover:opacity-100 group-hover:brightness-100"
        :src="map.retro_map.preview_url"
        alt=""
        loading="lazy"
      />

      <!-- Submit CTA — visible on hover -->
      <p class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-['Luckiest_Guy'] font-border text-2xl text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
        Submit Your<br />Recreation
      </p>
    </div>
  </RouterLink>
</template>
