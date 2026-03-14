import { computed, ref, watch, type Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRetroGames } from '@/services/api/retro-games/queries';
import type { Difficulty } from '@/constants/difficulties';

export interface Category {
  id: number;
  name: string;
  query: string;
}

function nameToQuery(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/gi, '_');
}

/**
 * Manages NP category selection: fetches retro games, derives categories
 * from the selected difficulty's game_id, syncs with URL query param.
 */
export function useCategorySelector(
  enabled: Ref<boolean>,
  selectedDifficulty: Ref<Difficulty | undefined>,
) {
  const route = useRoute();
  const router = useRouter();

  const { data: retroGamesResponse } = useRetroGames({ per_page: 100 }, { enabled });

  const categories = computed(() => {
    if (!retroGamesResponse.value || !selectedDifficulty.value) return null;
    const gameId = selectedDifficulty.value.value;
    const matching = retroGamesResponse.value.data.filter((rg) => rg.game_id === gameId);

    const seen = new Map<number, Category>();
    for (const rg of matching) {
      if (!seen.has(rg.category_id)) {
        seen.set(rg.category_id, {
          id: rg.category_id,
          name: rg.category_name,
          query: nameToQuery(rg.category_name),
        });
      }
    }
    const cats = Array.from(seen.values()).sort((a, b) => a.id - b.id);
    return cats.length > 1 ? cats : null;
  });

  const selectedQuery = ref('');

  watch([categories, () => route.query['category']], ([cats, queryCat]) => {
    if (!cats) { selectedQuery.value = ''; return; }
    if (typeof queryCat === 'string' && cats.some((c) => c.query === queryCat)) {
      selectedQuery.value = queryCat;
      return;
    }
    selectedQuery.value = cats[0]!.query;
  }, { immediate: true });

  const selected = computed(() =>
    categories.value?.find((c) => c.query === selectedQuery.value) ?? categories.value?.[0]
  );

  function onCategoryChange(query: string) {
    selectedQuery.value = query;
    router.replace({ query: { ...route.query, category: query } });
  }

  return {
    categories,
    selected,
    selectedQuery,
    onCategoryChange,
  };
}
