<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useFormats } from '@/services/api/formats/queries';
import { useLeaderboard } from '@/services/api/leaderboard/queries';
import type { LeaderboardValue } from '@/services/api/leaderboard/types';
import {
  FORMAT_ICONS,
  FORMATS_WITH_POINTS,
  LEADERBOARD_VALUES,
} from '@/constants/formats';
import Button from '@/components/ui/Button.vue';
import IconSelector from '@/components/ui/IconSelector.vue';
import LeaderboardEntry from '@/components/leaderboard/LeaderboardEntry.vue';
import LeaderboardEntrySkeleton from '@/components/leaderboard/LeaderboardEntrySkeleton.vue';
import Pagination from '@/components/ui/Pagination.vue';

const route = useRoute();
const router = useRouter();
const { data: formats } = useFormats();

// --- Format selector ---
const selectedFormatId = ref('');

const leaderboardFormats = computed(() => {
  if (!formats.value) return [];
  return formats.value.data
    .filter((f) => !f.hidden && f.run_submission_status !== 'closed')
    .map((f) => {
      const icon = FORMAT_ICONS.find((fi) => fi.id === f.id);
      return { id: f.id, image: icon?.image ?? '', name: f.name };
    })
    .filter((f) => f.image);
});

const formatOptions = computed(() =>
  leaderboardFormats.value.map((f) => ({
    image: f.image,
    key: f.id.toString(),
    name: f.name,
  }))
);

watch([leaderboardFormats, () => route.query['format']], ([fmts, queryFormat]) => {
  if (!fmts.length) return;
  if (typeof queryFormat === 'string' && fmts.some((f) => f.id.toString() === queryFormat)) {
    selectedFormatId.value = queryFormat;
    return;
  }
  selectedFormatId.value = fmts[0]!.id.toString();
}, { immediate: true });

function onFormatChange(key: string) {
  const defaultValue = FORMATS_WITH_POINTS.includes(Number(key)) ? 'points' : 'lccs';
  router.replace({ query: { format: key, value: defaultValue, page: '1' } });
}

// --- Value selector ---
const availableValues = computed(() => {
  const fmtId = Number(selectedFormatId.value);
  if (FORMATS_WITH_POINTS.includes(fmtId)) {
    return LEADERBOARD_VALUES;
  }
  return LEADERBOARD_VALUES.filter((v) => v.key !== 'points');
});

const selectedValue = ref('points');

watch([availableValues, () => route.query['value']], ([values, queryValue]) => {
  if (typeof queryValue === 'string' && values.some((v) => v.key === queryValue)) {
    selectedValue.value = queryValue;
    return;
  }
  selectedValue.value = values[0]!.key;
}, { immediate: true });

function onValueChange(key: string) {
  router.replace({ query: { ...route.query, value: key, page: '1' } });
}

const currentValueOption = computed(() =>
  LEADERBOARD_VALUES.find((v) => v.key === selectedValue.value) ?? LEADERBOARD_VALUES[0]!
);

// --- Pagination ---
const currentPage = ref(1);

watch(() => route.query['page'], (queryPage) => {
  const parsed = Number(queryPage);
  if (Number.isInteger(parsed) && parsed >= 1) {
    currentPage.value = parsed;
    return;
  }
  currentPage.value = 1;
}, { immediate: true });

function onPageChange(page: number) {
  router.replace({ query: { ...route.query, page: page.toString() } });
}

// --- Leaderboard query ---
const ENTRIES_PER_PAGE = 50;

const { data: leaderboard, isLoading } = useLeaderboard(
  computed(() => {
    if (!selectedFormatId.value) return undefined;
    return {
      format_id: Number(selectedFormatId.value),
      include: 'user.flair',
      page: currentPage.value,
      per_page: ENTRIES_PER_PAGE,
      value: selectedValue.value as LeaderboardValue,
    };
  }),
  { enabled: computed(() => Boolean(selectedFormatId.value)) },
);

const cachedLeaderboardMeta = ref(leaderboard.value?.meta);
watch(() => leaderboard.value?.meta, (meta) => {
  if (meta) cachedLeaderboardMeta.value = meta;
});
</script>

<template>
  <div>
    <h1 class="text-center mt-6 mb-4 font-['Luckiest_Guy'] text-3xl md:text-4xl">
      Leaderboard
    </h1>

    <!-- Format selector -->
    <IconSelector
      :options="formatOptions"
      :model-value="selectedFormatId"
      @update:model-value="onFormatChange"
    />

    <!-- Value type selector -->
    <div class="flex flex-wrap justify-center gap-3 my-6">
      <Button
        v-for="val in availableValues"
        :key="val.key"
        :active="val.key === selectedValue"
        @click="onValueChange(val.key)"
      >
        {{ val.label }}
      </Button>
    </div>

    <!-- Pagination top -->
    <Pagination
      v-if="cachedLeaderboardMeta"
      :current-page="cachedLeaderboardMeta.current_page"
      :last-page="cachedLeaderboardMeta.last_page"
      :disabled="isLoading"
      @update:current-page="onPageChange"
    />

    <!-- Leaderboard entries -->
    <template v-if="isLoading">
      <LeaderboardEntrySkeleton v-for="i in ENTRIES_PER_PAGE" :key="i" :placement="i" />
    </template>

    <template v-else-if="leaderboard && leaderboard.data.length > 0">
      <div class="my-4">
        <LeaderboardEntry
          v-for="entry in leaderboard.data"
          :key="entry.user.discord_id"
          :placement="entry.placement"
          :score="entry.score"
          :suffix-icon="currentValueOption.icon"
          :suffix-text="currentValueOption.suffix"
          :user="entry.user"
        />
      </div>
    </template>

    <p v-else class="text-center my-8 text-(--color-text-muted) text-lg">
      Nobody's here...
    </p>

    <!-- Pagination bottom -->
    <Pagination
      v-if="cachedLeaderboardMeta"
      :current-page="cachedLeaderboardMeta.current_page"
      :last-page="cachedLeaderboardMeta.last_page"
      :disabled="isLoading"
      @update:current-page="onPageChange"
    />
  </div>
</template>
