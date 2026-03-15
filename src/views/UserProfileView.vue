<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import CompletionList from '@/components/completions/CompletionList.vue';
import MapGrid from '@/components/maps/MapGrid.vue';
import Pagination from '@/components/ui/Pagination.vue';
import { useMaps } from '@/services/api/maps/queries';
import { formatDate } from '@/utils/dates';

const route = useRoute();
const userId = computed(() => route.params['id'] as string);

// --- Created Maps ---
const mapsPerPage = 12;
const mapsPage = ref(1);
const { data: mapsResponse, isLoading: mapsLoading } = useMaps(
  computed(() => ({
    created_by: userId.value,
    page: mapsPage.value,
    per_page: mapsPerPage,
  })),
);

const createdMaps = computed(() => mapsResponse.value?.data);
const cachedMapsMeta = ref(mapsResponse.value?.meta);
watch(() => mapsResponse.value?.meta, (meta) => {
  if (meta) cachedMapsMeta.value = meta;
});
</script>

<template>
  <div>
    <!-- Completions -->
    <div class="my-6">
      <h2 class="font-['Luckiest_Guy'] text-2xl text-center mb-4">Completions</h2>
      <CompletionList
        :params="{
          player_id: userId,
          deleted: 'exclude',
          pending: 'exclude',
        }"
        empty-message="No completions yet."
      >
        <template #default="{ completion }">
          <RouterLink
            :to="`/map/${completion.map.code}`"
            class="no-underline! text-(--color-text)! hover:text-(--color-active)!"
          >
            <div class="flex items-center gap-3">
              <img
                class="w-16 h-auto aspect-[3/2] bg-(--color-primary) rounded-sm shrink-0"
                :src="completion.map.map_preview_url"
                alt=""
                loading="lazy"
              />
              <div>
                <span class="font-['Luckiest_Guy'] font-border text-base">
                  {{ completion.map.name }}
                </span>
                <p class="text-sm text-(--color-text-muted) mb-0">
                  {{ formatDate(completion.submitted_on) }}
                </p>
              </div>
            </div>
          </RouterLink>
        </template>
      </CompletionList>
    </div>

    <!-- Created Maps -->
    <div class="my-6">
      <h2 class="font-['Luckiest_Guy'] text-2xl text-center mb-4">Created Maps</h2>
      <MapGrid :maps="mapsLoading ? undefined : createdMaps" :skeleton-count="mapsPerPage" />
      <p v-if="!mapsLoading && createdMaps?.length === 0" class="text-center text-(--color-text-muted)">
        No created maps.
      </p>
      <Pagination
        v-if="cachedMapsMeta"
        :current-page="cachedMapsMeta.current_page"
        :last-page="cachedMapsMeta.last_page"
        :disabled="mapsLoading"
        @update:current-page="mapsPage = $event"
      />
    </div>
  </div>
</template>
