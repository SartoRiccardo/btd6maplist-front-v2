<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useFormats } from '@/services/api/formats/queries';
import { useMaps } from '@/services/api/maps/queries';
import { useConfig } from '@/services/api/config/queries';
import { useAuthStore } from '@/stores/auth';
import { useNostalgiaPackData } from '@/composables/useNostalgiaPackData';
import { useMapGroups } from '@/composables/useMapGroups';
import { FORMAT_MAPLIST, FORMAT_NOSTALGIA_PACK, FORMAT_BEST_OF_THE_BEST, FORMAT_DESCRIPTIONS } from '@/constants/formats';
import { FORMAT_DIFFICULTIES } from '@/constants/difficulties';
import type { GhostMap, MapWithMetadata } from '@/services/api/maps/types';
import MapGrid from '@/components/maps/MapGrid.vue';
import PlacementBadge from '@/components/maps/badges/PlacementBadge.vue';
import MinimapBadge from '@/components/maps/badges/MinimapBadge.vue';
import IconSelector from '@/components/ui/IconSelector.vue';
import GhostBtd6Map from '@/components/maps/GhostBtd6Map.vue';
import LinkButton from '@/components/ui/LinkButton.vue';

// --- Services & stores ---
const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const { data: formats } = useFormats();
const { data: config } = useConfig();

// --- Route & format ---
const slug = computed(() => route.params['slug'] as string);
const format = computed(() => formats.value?.data.find((f) => f.slug === slug.value));
const formatId = computed(() => format.value?.id);
const isNP = computed(() => formatId.value === FORMAT_NOSTALGIA_PACK);
const btd6Version = computed(() => config.value?.current_btd6_ver);

// --- Difficulty selector ---
const difficulties = computed(() =>
  formatId.value != null ? FORMAT_DIFFICULTIES[formatId.value] ?? null : null
);

const difficultyOptions = computed(() =>
  difficulties.value?.map((d) => ({ image: d.image, key: d.query, name: d.name })) ?? []
);

const selectedDifficultyQuery = ref('');

watch([difficulties, () => route.query['difficulty']], ([diffs, queryDiff]) => {
  if (!diffs) return;
  if (typeof queryDiff === 'string' && diffs.some((d) => d.query === queryDiff)) {
    selectedDifficultyQuery.value = queryDiff;
    return;
  }
  selectedDifficultyQuery.value = diffs[0]!.query;
}, { immediate: true });

const selectedDifficulty = computed(() =>
  difficulties.value?.find((d) => d.query === selectedDifficultyQuery.value) ?? difficulties.value?.[0]
);

const currentDescription = computed(() =>
  selectedDifficulty.value?.description
  ?? (formatId.value != null ? FORMAT_DESCRIPTIONS[formatId.value] : undefined)
);

function onDifficultyChange(query: string) {
  selectedDifficultyQuery.value = query;
  const { category: _, ...rest } = route.query;
  router.replace({ query: { ...rest, difficulty: query } });
}

function subfilterString(value: number | number[]): string {
  return Array.isArray(value) ? value.join(',') : value.toString();
}

// --- Maps query ---
const { data: mapsResponse } = useMaps(
  computed(() => {
    if (formatId.value == null) return undefined;
    const params: {
      format_id: number;
      format_subfilter?: string;
      fill_missing_retro?: true;
      per_page: number;
    } = {
      format_id: formatId.value,
      per_page: 150,
    };
    if (selectedDifficulty.value) {
      params.format_subfilter = subfilterString(selectedDifficulty.value.value);
    }
    if (isNP.value) {
      params.fill_missing_retro = true;
    }
    return params;
  }),
  { enabled: computed(() => formatId.value != null) },
);

// --- NP-specific: categories & progress ---
const {
  categories,
  selected: selectedCategory,
  selectedQuery: selectedCategoryQuery,
  onCategoryChange,
  progress,
} = useNostalgiaPackData(isNP, computed(() => selectedDifficulty.value));

// --- Filtered & grouped maps ---
const filteredMaps = computed(() => {
  const maps = mapsResponse.value?.data;
  if (!maps || !selectedCategory.value) return maps;
  return maps.filter((m) => m.retro_map?.game.category_id === selectedCategory.value!.id);
});

const mapGroups = useMapGroups(filteredMaps, formatId);

// --- Display flags ---
const isBurning = computed(() =>
  formatId.value === FORMAT_BEST_OF_THE_BEST
    ? (map: MapWithMetadata) => map.botb_difficulty === 4
    : undefined
);

const showSubmitButton = computed(() =>
  formatId.value != null
  && (!auth.isAuthenticated || auth.hasPermission('create:map_submission', formatId.value))
);

const showAddButton = computed(() =>
  formatId.value != null && auth.hasPermission('create:map', formatId.value)
);
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
    <IconSelector
      v-if="difficulties"
      :options="difficultyOptions"
      :model-value="selectedDifficultyQuery"
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
      <div class="relative h-6 bg-(--color-secondary) rounded-full overflow-hidden">
        <div
          class="h-full bg-(--color-highlight) rounded-full transition-[width] duration-500"
          :style="{ width: `${progress.totalMaps > 0 ? (progress.mapsRemade / progress.totalMaps) * 100 : 0}%` }"
        />
        <span class="absolute inset-0 flex items-center justify-center text-sm font-bold font-border">
          {{ Math.round(progress.totalMaps > 0 ? (progress.mapsRemade / progress.totalMaps) * 100 : 0) }}% remade — {{ progress.mapsRemade }}/{{ progress.totalMaps }}
        </span>
      </div>
    </div>

    <!-- Difficulty Description -->
    <p v-if="currentDescription" class="text-center w-[90%] mx-auto my-8">
      {{ currentDescription }}
    </p>

    <!-- Submission Rules Links -->
    <p v-if="format?.map_submission_status !== 'closed' || format?.run_submission_status !== 'closed'" class="text-center my-4">
      <RouterLink v-if="format?.map_submission_status !== 'closed'" :to="`/maps/${slug}/map-rules`">
        Map Submission Rules
      </RouterLink>
      <template v-if="format?.map_submission_status !== 'closed' && format?.run_submission_status !== 'closed'">
        {{ ' | ' }}
      </template>
      <RouterLink v-if="format?.run_submission_status !== 'closed'" :to="`/maps/${slug}/completion-rules`">
        Completion Submission Rules
      </RouterLink>
    </p>

    <!-- Action Buttons -->
    <div v-if="showSubmitButton || showAddButton" class="flex justify-center gap-4 my-4">
      <LinkButton v-if="showSubmitButton" :to="`/map/submit?on=${formatId}`">
        <i class="bi bi-pencil-fill mr-0.5" /> Submit a Map
      </LinkButton>
      <LinkButton v-if="showAddButton" :to="`/map/new?on=${formatId}`">
        <i class="bi bi-plus-lg mr-0.5" /> Add Map
      </LinkButton>
    </div>

    <!-- Discord Link -->
    <p v-if="format?.discord_server_url" class="text-center my-4">
      Join the
      <a :href="format.discord_server_url" target="_blank">
        <i class="bi bi-discord" />&nbsp;Discord server
      </a>
      if you would like to interact with the community more!
    </p>

    <!-- Map Groups -->
    <template v-if="mapGroups">
      <div v-for="(group, i) in mapGroups" :key="i">
        <h2 v-if="group.subcategoryName" class="text-center mt-8 mb-2 font-['Luckiest_Guy'] text-2xl">
          {{ group.subcategoryName }}
        </h2>
        <MapGrid :maps="group.maps" :btd6-version="btd6Version" :burning="isBurning">
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
          <template #ghost="{ map }">
            <GhostBtd6Map :map="(map as GhostMap)" />
          </template>
        </MapGrid>
      </div>
    </template>
    <MapGrid v-else :btd6-version="btd6Version" />
  </div>
</template>
