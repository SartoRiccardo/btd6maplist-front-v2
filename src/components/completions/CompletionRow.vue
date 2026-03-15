<script setup lang="ts">
import { computed } from 'vue';
import type { Completion } from '@/services/api/completions/types';
import { FORMAT_ICONS, FORMATS_WITHOUT_GERALDO } from '@/constants/formats';
import Badge from '@/components/common/Badge.vue';
import Button from '@/components/ui/Button.vue';

const props = defineProps<{
  completion: Completion;
  expanded?: boolean;
}>();

const emit = defineEmits<{
  toggleDetail: [];
}>();

const hideNoGeraldo = computed(() => FORMATS_WITHOUT_GERALDO.includes(props.completion.format_id));

const formatInfo = computed(() =>
  FORMAT_ICONS.find((f) => f.id === props.completion.format_id)
);
</script>

<template>
  <div class="bg-(--color-secondary) rounded-(--radius-panel) my-2 py-2 px-3">
    <!-- Large screens: grid with fixed columns for medals/format/button -->
    <div class="hidden md:grid items-center gap-2" style="grid-template-columns: 1fr 9rem 10rem auto">
      <!-- Slot -->
      <div class="min-w-0">
        <slot />
      </div>

      <!-- Medals -->
      <div class="flex items-center gap-2">
        <img
          :src="completion.black_border
            ? '/images/medals/medal_bb.webp'
            : '/images/medals/medal_win.webp'"
          :title="completion.black_border ? 'Black Border' : 'CHIMPS'"
          class="w-[40px] h-[40px]"
        />
        <img
          src="/images/medals/medal_nogerry.webp"
          title="No Optimal Hero"
          class="w-[40px] h-[40px]"
          :class="hideNoGeraldo ? 'opacity-0' : { 'medal-blocked': !completion.no_geraldo }"
        />
        <img
          src="/images/medals/medal_lcc.webp"
          title="Current LCC"
          class="w-[40px] h-[40px]"
          :class="completion.is_current_lcc ? '' : 'opacity-0'"
        />
      </div>

      <!-- Format ruleset -->
      <div v-if="formatInfo" class="flex items-center gap-1.5">
        <Badge :src="formatInfo.image" :alt="formatInfo.name" class="translate-y-0 scale-[125%] mr-1" />
        <span class="text-sm">{{ formatInfo.name }} ruleset</span>
      </div>
      <div v-else />

      <!-- Show more -->
      <Button @click="emit('toggleDetail')">
        <i class="bi bi-search" />
      </Button>
    </div>

    <!-- Small screens: two rows -->
    <div class="md:hidden">
      <div class="flex items-center gap-2">
        <div class="flex-1 min-w-0">
          <slot />
        </div>
        <Button class="shrink-0" @click="emit('toggleDetail')">
          <i class="bi bi-search" />
        </Button>
      </div>

      <div class="flex items-center gap-2 mt-2">
        <!-- Medals -->
        <div class="flex items-center gap-2">
          <img
            :src="completion.black_border
              ? '/images/medals/medal_bb.webp'
              : '/images/medals/medal_win.webp'"
            :title="completion.black_border ? 'Black Border' : 'CHIMPS'"
            class="w-[40px] h-[40px]"
          />
          <img
            src="/images/medals/medal_nogerry.webp"
            title="No Optimal Hero"
            class="w-[40px] h-[40px]"
            :class="hideNoGeraldo ? 'opacity-0' : { 'medal-blocked': !completion.no_geraldo }"
          />
          <img
            src="/images/medals/medal_lcc.webp"
            title="Current LCC"
            class="w-[40px] h-[40px]"
            :class="completion.is_current_lcc ? '' : 'opacity-0'"
          />
        </div>

        <!-- Format ruleset -->
        <div v-if="formatInfo" class="flex-1 flex items-center gap-1.5">
          <Badge :src="formatInfo.image" :alt="formatInfo.name" class="translate-y-0 scale-[125%] mr-1" />
          <span class="text-sm">{{ formatInfo.name }} ruleset</span>
        </div>
      </div>
    </div>

    <!-- Expanded detail -->
    <div v-if="expanded" class="border-t border-(--color-primary) mt-2 pt-2">
      <slot name="detail" />
    </div>
  </div>
</template>

<style scoped>
.medal-blocked {
  filter: brightness(0%) drop-shadow(1px 1px 0 white) drop-shadow(-1px -1px 0 white);
}
</style>
