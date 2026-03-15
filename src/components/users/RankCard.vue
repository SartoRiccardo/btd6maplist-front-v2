<script setup lang="ts">
import type { UserFormatRanks, RankEntry } from '@/services/api/users/types';
import { FORMAT_ICONS } from '@/constants/formats';
import { getPositionColor } from '@/utils/colors';
import Badge from '@/components/common/Badge.vue';
import Tooltip from '@/components/ui/Tooltip.vue';

const props = defineProps<{ ranks: UserFormatRanks }>();

const formatInfo = FORMAT_ICONS.find((f) => f.id === props.ranks.format_id);

interface MedalDef {
  key: 'points' | 'lccs' | 'no_geraldo' | 'black_border';
  image: string;
  tooltip: string;
  suffix?: string;
}

const medals: MedalDef[] = [
  { key: 'points', image: '/images/medals/medal_win.webp', tooltip: 'Leaderboard points', suffix: 'pt' },
  { key: 'black_border', image: '/images/medals/medal_bb.webp', tooltip: 'Black Border' },
  { key: 'no_geraldo', image: '/images/medals/medal_nogerry.webp', tooltip: 'No Optimal Hero' },
  { key: 'lccs', image: '/images/medals/medal_lcc.webp', tooltip: 'Least Cash CHIMPS' },
];

function getEntry(key: MedalDef['key']): RankEntry | null {
  return props.ranks[key];
}

function formatScore(entry: RankEntry | null, suffix?: string): string {
  if (!entry) return '—';
  return `${entry.score}${suffix ?? ''}`;
}
</script>

<template>
  <div class="bg-(--color-secondary) rounded-(--radius-panel) p-4">
    <!-- Row 1: Format icon + name -->
    <div class="flex items-center gap-2 mb-4 text-2xl">
      <Badge v-if="formatInfo" :src="formatInfo.image" :alt="formatInfo.name ?? ''" class="translate-y-0!" />
      <span class="font-bold font-['Luckiest_Guy']">{{ formatInfo?.name ?? `Format ${ranks.format_id}` }}</span>
    </div>

    <!-- Row 2: Medals -->
    <div class="flex justify-center gap-5">
      <Tooltip v-for="medal in medals" :key="medal.key" :text="medal.tooltip">
        <div
          class="relative"
          :class="{ 'opacity-25': !getEntry(medal.key)?.placement }"
        >
          <img :src="medal.image" alt="" class="w-[49px] h-[49px]" />

          <!-- Score -->
          <p class="absolute bottom-[-0.5rem] left-1/2 -translate-x-1/2 mb-0 font-['Luckiest_Guy'] font-border text-md whitespace-nowrap">
            {{ formatScore(getEntry(medal.key), medal.suffix) }}
          </p>

          <!-- Placement badge -->
          <div
            v-if="getEntry(medal.key)?.placement"
            class="absolute top-[-0.5rem] right-[-0.5rem] px-[0.3rem] rounded-lg font-border text-md leading-tight"
            :style="{
              backgroundColor: getPositionColor(getEntry(medal.key)?.placement ?? null) ?? '#7191AD',
              border: getEntry(medal.key)?.placement ? undefined : '1px solid var(--color-primary)',
            }"
          >
            {{ getEntry(medal.key)?.placement ? `#${getEntry(medal.key)!.placement}` : '#-' }}
          </div>
        </div>
      </Tooltip>
    </div>
  </div>
</template>
