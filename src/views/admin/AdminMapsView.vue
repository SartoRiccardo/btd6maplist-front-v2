<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useMaps } from "@/services/api/maps/queries";
import MapGrid from "@/components/maps/MapGrid.vue";
import PlacementBadge from "@/components/maps/badges/PlacementBadge.vue";
import Pagination from "@/components/ui/Pagination.vue";

const page = ref(1);

const { data: mapsResponse, isLoading } = useMaps(
  computed(() => ({
    deleted: "only_or_hidden" as const,
    sort_by: "placement_curver",
    page: page.value,
    per_page: 54,
  })),
);

const cachedMeta = ref(mapsResponse.value?.meta);
watch(
  () => mapsResponse.value?.meta,
  (meta) => {
    if (meta) cachedMeta.value = meta;
  },
);
</script>

<template>
  <div>
    <h1 class="font-['Luckiest_Guy'] text-3xl text-center my-6">Maps</h1>

    <MapGrid :maps="mapsResponse?.data" :skeleton-count="50">
      <template #badge="{ map }">
        <PlacementBadge
          v-if="map.placement_curver != null"
          :placement="map.placement_curver"
        />
      </template>
    </MapGrid>

    <div class="flex justify-center mt-6">
      <Pagination
        v-if="cachedMeta"
        :current-page="cachedMeta.current_page"
        :last-page="cachedMeta.last_page"
        :disabled="isLoading"
        @update:current-page="page = $event"
      />
    </div>
  </div>
</template>
