<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useFormats } from '@/services/api/formats/queries';
import { useMaps } from '@/services/api/maps/queries';
import { useConfig } from '@/services/api/config/queries';
import MapGrid from '@/components/maps/MapGrid.vue';
import PlacementBadge from '@/components/maps/badges/PlacementBadge.vue';
import MinimapBadge from '@/components/maps/badges/MinimapBadge.vue';
import DifficultySelector from '@/components/maps/DifficultySelector.vue';
import { FORMAT_MAPLIST, FORMAT_NOSTALGIA_PACK, FORMAT_BEST_OF_THE_BEST, FORMAT_DESCRIPTIONS } from '@/constants/formats';
import { FORMAT_DIFFICULTIES } from '@/constants/difficulties';
import { useNostalgiaPackData } from '@/composables/useNostalgiaPackData';

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

const currentDescription = computed(() =>
  selectedDifficulty.value?.description
  ?? (formatId.value != null ? FORMAT_DESCRIPTIONS[formatId.value] : undefined)
);

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

const isBurning = computed(() =>
  formatId.value === FORMAT_BEST_OF_THE_BEST
    ? (map: import('@/services/api/maps/types').MapWithMetadata) => map.botb_difficulty === 4
    : undefined
);

// NP category selector
const isNP = computed(() => formatId.value === FORMAT_NOSTALGIA_PACK);
const {
  categories,
  selected: selectedCategory,
  selectedQuery: selectedCategoryQuery,
  onCategoryChange,
  progress,
} = useNostalgiaPackData(isNP, computed(() => selectedDifficulty.value));

const filteredMaps = computed(() => {
  const maps = mapsResponse.value?.data;
  if (!maps || !selectedCategory.value) return maps;
  return maps.filter((m) => m.retro_map?.game.category_id === selectedCategory.value!.id);
});
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

    <!-- Category Buttons (NP) -->
    <div v-if="categories" class="flex flex-wrap justify-center gap-4 my-6">
      <button
        v-for="cat in categories"
        :key="cat.id"
        class="px-4 py-2 rounded-(--radius-btn) font-bold font-border cursor-pointer transition-colors duration-200"
        :class="cat.query === selectedCategoryQuery
          ? 'bg-(--color-highlight) text-white'
          : 'bg-(--color-contrast) text-(--color-text) hover:bg-(--color-active)'"
        @click="onCategoryChange(cat.query)"
      >
        {{ cat.name }}
      </button>
    </div>

    <!-- Progress Bar (NP) -->
    <div v-if="progress" class="w-[90%] max-w-md mx-auto my-6">
      <div class="flex justify-between text-sm mb-1">
        <span>Remade</span>
        <span>{{ progress.mapsRemade }} / {{ progress.totalMaps }}</span>
      </div>
      <div class="h-4 bg-(--color-secondary) rounded-full overflow-hidden">
        <div
          class="h-full bg-(--color-highlight) rounded-full transition-[width] duration-500"
          :style="{ width: `${progress.totalMaps > 0 ? (progress.mapsRemade / progress.totalMaps) * 100 : 0}%` }"
        />
      </div>
    </div>

    <!-- Difficulty Description -->
    <p v-if="currentDescription" class="text-center w-[90%] mx-auto my-8">
      {{ currentDescription }}
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
    <MapGrid :maps="filteredMaps" :btd6-version="btd6Version" :burning="isBurning">
      <template #badge="{ map }">
        <PlacementBadge
          v-if="formatId === FORMAT_MAPLIST && map.placement_curver != null && config"
          :placement="map.placement_curver"
          :config="config"
        />
        <MinimapBadge
          v-else-if="formatId === FORMAT_NOSTALGIA_PACK && map.retro_map"
          :src="map.retro_map.preview_url"
        />
      </template>
    </MapGrid>
  </div>
</template>
