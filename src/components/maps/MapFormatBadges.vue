<script setup lang="ts">
import { computed } from "vue";
import Badge from "@/components/common/Badge.vue";
import { useConfig } from "@/services/api/config/queries";
import { useFormats } from "@/services/api/formats/queries";
import { getMapFormatBadges } from "@/utils/formatBadges";
import type { MapWithMetadata } from "@/services/api/maps/types";

const props = defineProps<{ map: MapWithMetadata }>();

const { data: config } = useConfig();
const { data: formatsResponse } = useFormats();

const visibleFormatIds = computed(
  () => formatsResponse.value?.data.filter((f) => !f.hidden).map((f) => f.id) ?? [],
);

const badges = computed(() =>
  getMapFormatBadges(props.map, { config: config.value, visibleFormatIds: visibleFormatIds.value }),
);
</script>

<template>
  <div
    v-if="badges.length > 0"
    class="absolute bottom-[-0.75rem] left-0 w-full flex justify-center gap-1 z-10 text-[28px] md:text-[40px]"
  >
    <template v-for="badge in badges" :key="badge.label">
      <img
        v-if="badge.squareImage"
        :src="badge.icon"
        :title="badge.label"
        class="h-[1.5em] w-[1.5em] rounded-sm object-cover"
      />
      <Badge
        v-else
        :src="badge.icon"
        :alt="badge.label"
        :title="badge.label"
        class="translate-y-0!"
      />
    </template>
  </div>
</template>
