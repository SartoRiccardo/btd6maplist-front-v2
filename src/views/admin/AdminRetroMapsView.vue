<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { refDebounced } from "@vueuse/core";
import { useRetroMaps } from "@/services/api/retro-maps/queries";
import { useRetroGames } from "@/services/api/retro-games/queries";
import { NP_DIFFICULTIES } from "@/constants/difficulties";
import { RouterLink } from "vue-router";
import Pagination from "@/components/ui/Pagination.vue";
import Badge from "@/components/common/Badge.vue";

const page = ref(1);
const search = ref("");
const debouncedSearch = refDebounced(search, 300);
const filterKey = ref("");

watch([debouncedSearch, filterKey], () => {
  page.value = 1;
});

const filterParams = computed(() => {
  if (!filterKey.value) return {};
  const [gameId, categoryId] = filterKey.value.split(":");
  return {
    game_id: Number(gameId),
    ...(categoryId !== undefined ? { category_id: Number(categoryId) } : {}),
  };
});

const { data: maps, isLoading } = useRetroMaps(
  computed(() => ({
    page: page.value,
    per_page: 20,
    search: debouncedSearch.value || undefined,
    ...filterParams.value,
  })),
);

const cachedMeta = ref<{ lastPage: number } | null>(null);
watch(
  () => maps.value,
  (data) => {
    if (data) {
      cachedMeta.value = { lastPage: data.meta.last_page };
    }
  },
);

const { data: retroGamesResponse } = useRetroGames({ per_page: 100 });

interface FilterOption {
  key: string;
  label: string;
}

const filterOptions = computed<FilterOption[]>(() => {
  const games = retroGamesResponse.value?.data ?? [];
  const options: FilterOption[] = [];

  const seenGames = new Map<number, string>();
  const seenCats = new Set<string>();

  for (const g of [...games].sort(
    (a, b) => a.game_id - b.game_id || a.category_id - b.category_id,
  )) {
    if (!seenGames.has(g.game_id)) {
      seenGames.set(g.game_id, g.game_name);
      options.push({ key: String(g.game_id), label: `${g.game_name} (All)` });
    }
    const catKey = `${g.game_id}:${g.category_id}`;
    if (!seenCats.has(catKey)) {
      seenCats.add(catKey);
      options.push({
        key: catKey,
        label: `${g.game_name} (${g.category_name})`,
      });
    }
  }

  return options;
});

function gameIcon(gameId: number): string | undefined {
  return NP_DIFFICULTIES.find((d) => d.value === gameId)?.image;
}
</script>

<template>
  <div>
    <h1
      class="font-['Luckiest_Guy'] text-3xl md:text-4xl text-center mt-6 mb-4"
    >
      Retro Maps
    </h1>

    <div class="flex flex-wrap gap-2 mb-4">
      <input
        v-model="search"
        type="text"
        placeholder="Search maps..."
        class="flex-1 px-3 py-1.5 rounded-(--radius-btn) bg-(--color-primary) text-(--color-text) border border-(--color-contrast) focus:outline-none focus:border-(--color-active)"
      />
      <select
        v-model="filterKey"
        class="w-full sm:w-auto px-3 py-1.5 rounded-(--radius-btn) bg-(--color-primary) text-(--color-text) border border-(--color-contrast) focus:outline-none focus:border-(--color-active)"
      >
        <option value="">All games</option>
        <option v-for="opt in filterOptions" :key="opt.key" :value="opt.key">
          {{ opt.label }}
        </option>
      </select>
    </div>

    <div v-if="isLoading" class="flex justify-center">
      <p class="text-(--color-text-muted)">Loading...</p>
    </div>

    <template v-else-if="maps && maps.data.length > 0">
      <RouterLink
        v-for="map in maps.data"
        :key="map.id"
        :to="`/admin/retro-maps/${map.id}`"
        class="bg-(--color-secondary) rounded-(--radius-panel) my-2 py-2 px-3 flex items-center gap-3 no-underline hover:brightness-110"
      >
        <img
          :src="map.preview_url"
          :alt="map.name"
          class="aspect-[3/2] h-16 rounded-sm shrink-0 object-cover bg-(--color-primary)"
          loading="lazy"
        />
        <div class="min-w-0">
          <p
            class="font-['Luckiest_Guy'] text-(--color-text) font-border text-base leading-tight truncate"
          >
            {{ map.name }}
          </p>
          <p
            class="text-sm text-(--color-text-muted) flex items-center gap-1 mt-0.5"
          >
            <Badge
              v-if="gameIcon(map.game.game_id)"
              :src="gameIcon(map.game.game_id)!"
              :alt="map.game.game_name"
            />
            {{ map.game.game_name }}
          </p>
        </div>
      </RouterLink>
    </template>

    <p v-else-if="!isLoading" class="text-center text-(--color-text-muted)">
      No maps found.
    </p>

    <Pagination
      v-if="cachedMeta"
      :current-page="page"
      :last-page="cachedMeta.lastPage"
      :disabled="isLoading"
      @update:current-page="page = $event"
    />
  </div>
</template>
