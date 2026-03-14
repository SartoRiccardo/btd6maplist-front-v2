<script setup lang="ts">
import { RouterLink } from 'vue-router';
import type { MapWithMetadata } from '@/services/api/maps/types';
import Btd6Map from '@/components/maps/Btd6Map.vue';
import Btd6MapPlaceholder from '@/components/maps/Btd6MapPlaceholder.vue';

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
      <Btd6MapPlaceholder v-for="i in 12" :key="i" />
    </template>
  </div>
</template>
