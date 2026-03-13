<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { useFormats } from '@/services/api/formats/queries';
import { useMaps } from '@/services/api/maps/queries';
import { useConfig } from '@/services/api/config/queries';
import Btd6Map from '@/components/maps/Btd6Map.vue';
import PlacementBadge from '@/components/maps/badges/PlacementBadge.vue';
import MinimapBadge from '@/components/maps/badges/MinimapBadge.vue';

const route = useRoute();
const slug = computed(() => route.params['slug'] as string);

const { data: formats } = useFormats();
const format = computed(() =>
  formats.value?.data.find((f) => f.slug === slug.value)
);

const formatId = computed(() => format.value?.id);

const { data: mapsResponse } = useMaps(
  computed(() => formatId.value != null ? { format_id: formatId.value } : undefined),
  { enabled: computed(() => formatId.value != null) },
);

const { data: config } = useConfig();
const btd6Version = computed(() => config.value?.current_btd6_ver);
</script>

<template>
  <div>
    <!-- Header -->
    <div class="text-center mt-6 mb-8">
      <h1 class="font-['Luckiest_Guy'] text-3xl md:text-4xl">
        {{ format?.name ?? 'Loading...' }}
      </h1>
    </div>

    <!-- Map Grid -->
    <div class="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
      <template v-if="mapsResponse">
        <RouterLink
          v-for="map in mapsResponse.data"
          :key="map.code"
          :to="`/map/${map.code}`"
          class="group no-underline! text-(--color-text)!"
        >
          <Btd6Map :map="map" :btd6-version="btd6Version">
            <template #badge>
              <!-- Maplist: placement circle with points -->
              <PlacementBadge
                v-if="formatId === 1 && map.placement_curver != null && config"
                :placement="map.placement_curver"
                :config="config"
              />
              <!-- Nostalgia Pack: retro minimap -->
              <MinimapBadge
                v-else-if="formatId === 11 && map.retro_map"
                :src="map.retro_map.preview_url"
              />
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
          <div class="aspect-[3/2] bg-(--color-primary) mx-1.5 mb-1.5 rounded-sm" />
        </div>
      </template>
    </div>
  </div>
</template>
