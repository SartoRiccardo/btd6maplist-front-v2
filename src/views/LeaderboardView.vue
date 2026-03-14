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
const { data: leaderboard, isLoading } = useLeaderboard(
  computed(() => {
    if (!selectedFormatId.value) return undefined;
    return {
      format_id: Number(selectedFormatId.value),
      include: 'user.flair',
      page: currentPage.value,
      per_page: 50,
      value: selectedValue.value as LeaderboardValue,
    };
  }),
  { enabled: computed(() => Boolean(selectedFormatId.value)) },
);
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
      :current-page="currentPage"
      :last-page="leaderboard?.meta.last_page ?? 1"
      @update:current-page="onPageChange"
    />

    <!-- Leaderboard entries -->
    <div v-if="isLoading" class="text-center my-8 text-(--color-text-muted)">
      Loading...
    </div>

    <div v-else-if="!leaderboard?.data.length" class="text-center my-8 text-(--color-text-muted) text-lg">
      Nobody's here...
    </div>

    <div v-else class="my-4">
      <LeaderboardEntry
        v-for="entry in leaderboard.data"
        :key="entry.user.discord_id"
        :placement="entry.placement"
        :score="entry.score"
        :user="entry.user"
        :suffix="currentValueOption.suffix ? ` ${currentValueOption.suffix}` : ''"
      />
    </div>

    <!-- Pagination bottom -->
    <Pagination
      :current-page="currentPage"
      :last-page="leaderboard?.meta.last_page ?? 1"
      @update:current-page="onPageChange"
    />
  </div>
</template>
