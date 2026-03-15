<script setup lang="ts">
import { RouterLink } from 'vue-router';
import type { MapWithMetadata, MaybeGhostMap } from '@/services/api/maps/types';
import Btd6Map from '@/components/maps/Btd6Map.vue';
import Btd6MapPlaceholder from '@/components/maps/Btd6MapPlaceholder.vue';

withDefaults(defineProps<{
  maps?: MaybeGhostMap[] | undefined;
  btd6Version?: number | undefined;
  burning?: ((map: MapWithMetadata) => boolean) | undefined;
  border?: ((map: MapWithMetadata) => 'none' | 'black' | 'gold') | undefined;
  skeletonCount?: number;
}>(), {
  skeletonCount: 12,
});

defineSlots<{
  badge?: (props: { map: MapWithMetadata }) => unknown;
  bottom?: (props: { map: MapWithMetadata }) => unknown;
  ghost?: (props: { map: MaybeGhostMap }) => unknown;
}>();
</script>

<template>
  <div class="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
    <template v-if="maps">
      <template v-for="map in maps" :key="map.code ?? map.retro_map?.id">
        <template v-if="map.code === null && $slots['ghost']">
          <slot name="ghost" :map="map" />
        </template>
        <RouterLink
          v-else-if="map.code !== null"
          :to="`/map/${map.code}`"
          class="group no-underline! text-(--color-text)!"
        >
          <Btd6Map :map="map" :btd6-version="btd6Version" :burning="burning?.(map)" :border="border?.(map)">
            <template v-if="$slots['badge']" #badge>
              <slot name="badge" :map="map" />
            </template>
            <template v-if="$slots['bottom']" #bottom>
              <slot name="bottom" :map="map" />
            </template>
          </Btd6Map>
        </RouterLink>
      </template>
    </template>
    <template v-else>
      <Btd6MapPlaceholder v-for="i in skeletonCount" :key="i" />
    </template>
  </div>
</template>
