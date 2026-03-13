<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import type { Completion } from '@/services/api/completions/types';
import UserEntry from '@/components/users/UserEntry.vue';
import { fromNow } from '@/utils/dates';
import { FORMATS_WITHOUT_GERALDO } from '@/constants/formats';

const props = defineProps<{
  completion: Completion;
}>();

const hideNoGeraldo = computed(() => FORMATS_WITHOUT_GERALDO.includes(props.completion.format_id));
</script>

<template>
  <div class="bg-(--color-secondary) rounded-(--radius-panel) my-2 py-2 px-3">
    <!-- Row 1: Map preview + name -->
    <RouterLink
      :to="`/maps/${completion.map.code}`"
      class="no-underline! text-(--color-text)! hover:text-(--color-active)!"
    >
      <div class="flex items-center">
        <img
          class="w-24 h-auto aspect-[3/2] bg-(--color-primary) rounded-sm shrink-0"
          :src="completion.map.map_preview_url"
          alt=""
          loading="lazy"
        />
        <p class="mb-0 pl-3 font-['Luckiest_Guy'] font-border text-lg">
          {{ completion.map.name }}
        </p>
      </div>
    </RouterLink>

    <!-- Row 2: Players + Medals -->
    <div class="flex items-center justify-between mt-2">
      <div>
        <div v-for="player in completion.players" :key="player.discord_id">
          <UserEntry
            :user="player"
            :label="fromNow(completion.submitted_on)"
          />
        </div>
      </div>

      <!-- Medals -->
      <div class="flex gap-2 shrink-0">
        <img
          :src="completion.black_border
            ? '/images/medals/medal_bb.webp'
            : '/images/medals/medal_win.webp'"
          :title="completion.black_border ? 'CHIMPS (Black Border)' : 'CHIMPS completion'"
          class="w-[45px] h-[45px]"
        />
        <img
          v-if="!hideNoGeraldo"
          src="/images/medals/medal_nogerry.webp"
          title="No Optimal Hero"
          class="w-[45px] h-[45px]"
          :class="{ 'medal-blocked': !completion.no_geraldo }"
        />
        <img
          v-if="completion.is_current_lcc"
          src="/images/medals/medal_lcc.webp"
          title="Current LCC"
          class="w-[45px] h-[45px]"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.medal-blocked {
  filter: brightness(0%) drop-shadow(1px 1px 0 white) drop-shadow(-1px -1px 0 white);
}
</style>
