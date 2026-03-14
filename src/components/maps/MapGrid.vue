<script setup lang="ts">
import { RouterLink } from 'vue-router';
import type { MapWithMetadata } from '@/services/api/maps/types';
import Btd6Map from '@/components/maps/Btd6Map.vue';

defineProps<{
  maps?: MapWithMetadata[] | undefined;
  btd6Version?: number | undefined;
}>();

defineSlots<{
  badge?: (props: { map: MapWithMetadata }) => unknown;
}>();
</script>

<template>
  <div class="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
    <template v-if="maps">
      <RouterLink
        v-for="map in maps"
        :key="map.code"
        :to="`/map/${map.code}`"
        class="group no-underline! text-(--color-text)!"
      >
        <Btd6Map :map="map" :btd6-version="btd6Version">
          <template v-if="$slots['badge']" #badge>
            <slot name="badge" :map="map" />
          </template>
        </Btd6Map>
      </RouterLink>
    </template>
    <template v-else>
      <div
        v-for="i in 12"
        :key="i"
        class="bg-(--color-secondary) rounded-(--radius-panel) animate-pulse my-6"
      >
        <div class="h-5 w-3/4 bg-(--color-primary) rounded mx-auto my-2" />
        <div class="aspect-3/2 bg-(--color-primary) mx-1.5 mb-1.5 rounded-sm" />
      </div>
    </template>
  </div>
</template>
