<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import CompletionList from '@/components/completions/CompletionList.vue';
import MapGrid from '@/components/maps/MapGrid.vue';
import Pagination from '@/components/ui/Pagination.vue';
import { useMaps } from '@/services/api/maps/queries';
import { useUser } from '@/services/api/users/queries';
import { useConfig } from '@/services/api/config/queries';
import { useFormats } from '@/services/api/formats/queries';
import { formatDate } from '@/utils/dates';
import { getMapFormatBadges } from '@/utils/formatBadges';
import Badge from '@/components/common/Badge.vue';
import ProfileHeader from '@/components/users/ProfileHeader.vue';
import ProfileHeaderSkeleton from '@/components/users/ProfileHeaderSkeleton.vue';

const route = useRoute();
const userId = computed(() => route.params['id'] as string);
const { data: user, isLoading: userLoading } = useUser(userId, {
  include: ['achievement_roles', 'flair', 'medals', 'ranks'],
});
const { data: config } = useConfig();
const { data: formatsResponse } = useFormats();
const visibleFormatIds = computed(() =>
  formatsResponse.value?.data
    .filter((f) => !f.hidden)
    .map((f) => f.id) ?? []
);

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
    <!-- Profile Header -->
    <ProfileHeaderSkeleton v-if="userLoading" />
    <ProfileHeader v-else-if="user" :user="user" />

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
      <MapGrid :maps="mapsLoading ? undefined : createdMaps" :skeleton-count="mapsPerPage">
        <template #bottom="{ map }">
          <div v-if="getMapFormatBadges(map, { config, visibleFormatIds }).length > 0" class="absolute bottom-[-0.75rem] left-0 w-full flex justify-center gap-1 z-10 text-[28px] md:text-[40px]">
            <template v-for="badge in getMapFormatBadges(map, { config, visibleFormatIds })" :key="badge.label">
              <img
                v-if="badge.squareImage"
                :src="badge.icon"
                :title="badge.label"
                class="h-[1.5em] w-[1.5em] rounded-sm object-cover"
              />
              <Badge v-else :src="badge.icon" :alt="badge.label" :title="badge.label" class="translate-y-0!" />
            </template>
          </div>
        </template>
      </MapGrid>
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
