<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { useFormats } from '@/services/api/formats/queries';
import { useMaps } from '@/services/api/maps/queries';
import { useConfig } from '@/services/api/config/queries';
import Btd6Map from '@/components/maps/Btd6Map.vue';
import PlacementBadge from '@/components/maps/badges/PlacementBadge.vue';
import MinimapBadge from '@/components/maps/badges/MinimapBadge.vue';
import DifficultySelector from '@/components/maps/DifficultySelector.vue';
import { FORMAT_MAPLIST, FORMAT_NOSTALGIA_PACK } from '@/constants/formats';
import { FORMAT_DIFFICULTIES } from '@/constants/difficulties';

const route = useRoute();
const router = useRouter();
const slug = computed(() => route.params['slug'] as string);

const { data: formats } = useFormats();
const format = computed(() =>
  formats.value?.data.find((f) => f.slug === slug.value)
);

const formatId = computed(() => format.value?.id);

// Difficulty selector
const difficulties = computed(() =>
  formatId.value != null ? FORMAT_DIFFICULTIES[formatId.value] ?? null : null
);

const selectedQuery = ref('');

// Read initial difficulty from query param
watch([difficulties, () => route.query['difficulty']], ([diffs, queryDiff]) => {
  if (!diffs) return;
  if (typeof queryDiff === 'string' && diffs.some((d) => d.query === queryDiff)) {
    selectedQuery.value = queryDiff;
    return;
  }
  selectedQuery.value = diffs[0]!.query;
}, { immediate: true });

const selectedDifficulty = computed(() =>
  difficulties.value?.find((d) => d.query === selectedQuery.value) ?? difficulties.value?.[0]
);

function onDifficultyChange(query: string) {
  selectedQuery.value = query;
  router.replace({ query: { ...route.query, difficulty: query } });
}

const currentDifficultyDescription = computed(() => selectedDifficulty.value?.description);

function subfilterString(value: number | number[]): string {
  return Array.isArray(value) ? value.join(',') : value.toString();
}

// Maps query — include format_subfilter when difficulties exist
const { data: mapsResponse } = useMaps(
  computed(() => {
    if (formatId.value == null) return undefined;
    const params: { format_id: number; format_subfilter?: string } = {
      format_id: formatId.value,
    };
    if (selectedDifficulty.value) {
      params.format_subfilter = subfilterString(selectedDifficulty.value.value);
    }
    return params;
  }),
  { enabled: computed(() => formatId.value != null) },
);

const { data: config } = useConfig();
const btd6Version = computed(() => config.value?.current_btd6_ver);
</script>

<template>
  <div>
    <!-- Header -->
    <div class="text-center mt-6 mb-4">
      <h1 class="font-['Luckiest_Guy'] text-3xl md:text-4xl">
        {{ format?.name ?? 'Loading...' }}
      </h1>
    </div>

    <!-- Difficulty Selector -->
    <DifficultySelector
      v-if="difficulties"
      :difficulties="difficulties"
      :model-value="selectedQuery"
      @update:model-value="onDifficultyChange"
    />

    <!-- Difficulty Description -->
    <p v-if="currentDifficultyDescription" class="text-center w-[90%] mx-auto my-8">
      {{ currentDifficultyDescription }}
    </p>

    <!-- Discord Link -->
    <p v-if="format?.discord_server_url" class="text-center my-4">
      Join the
      <a :href="format.discord_server_url" target="_blank">
        <i class="bi bi-discord" />&nbsp;Discord server
      </a>
      if you would like to interact with the community more!
    </p>

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
                v-if="formatId === FORMAT_MAPLIST && map.placement_curver != null && config"
                :placement="map.placement_curver"
                :config="config"
              />
              <!-- Nostalgia Pack: retro minimap -->
              <MinimapBadge
                v-else-if="formatId === FORMAT_NOSTALGIA_PACK && map.retro_map"
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
          <div class="aspect-3/2 bg-(--color-primary) mx-1.5 mb-1.5 rounded-sm" />
        </div>
      </template>
    </div>
  </div>
</template>
