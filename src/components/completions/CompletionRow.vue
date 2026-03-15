<script setup lang="ts">
import { computed } from 'vue';
import type { Completion } from '@/services/api/completions/types';
import { FORMAT_ICONS } from '@/constants/formats';
import { useFormats } from '@/services/api/formats/queries';
import { useAuthStore } from '@/stores/auth';
import Badge from '@/components/common/Badge.vue';
import Button from '@/components/ui/Button.vue';
import Tooltip from '@/components/ui/Tooltip.vue';

const props = defineProps<{
  completion: Completion;
  expanded?: boolean;
  editUrl?: string;
}>();

const emit = defineEmits<{
  toggleDetail: [];
}>();

const auth = useAuthStore();
const { data: formats } = useFormats();

const hideNoGeraldo = computed(() => {
  const fmt = formats.value?.data.find((f) => f.id === props.completion.format_id);
  return fmt?.is_no_geraldo_enabled === false;
});

const formatInfo = computed(() =>
  FORMAT_ICONS.find((f) => f.id === props.completion.format_id)
);

const showEdit = computed(() =>
  props.editUrl != null
  && !props.completion.players.some((p) => p.discord_id === auth.user?.discord_id)
);

const isDeleted = computed(() => props.completion.deleted_on != null);
const isPending = computed(() => props.completion.accepted_by == null);

const statusPill = computed(() => {
  if (isDeleted.value && isPending.value) return { label: 'Rejected', class: 'bg-(--color-deleted)' };
  if (isDeleted.value) return { label: 'Deleted', class: 'bg-(--color-deleted)' };
  if (isPending.value) return { label: 'Pending', class: 'bg-(--color-pending)' };
  return null;
});
</script>

<template>
  <div class="bg-(--color-secondary) rounded-(--radius-panel) my-2 py-2 px-3 relative">
    <span
      v-if="statusPill"
      class="absolute top-[-0.5rem] left-[-0.5rem] text-xs font-bold px-2 py-0.5 rounded text-white z-10 opacity-100!"
      :class="statusPill.class"
    >
      {{ statusPill.label }}
    </span>

    <!-- Large screens: grid with fixed columns for medals/format/button -->
    <div class="hidden md:grid items-center gap-2" style="grid-template-columns: 1fr 19rem auto">
      <!-- Slot -->
      <div class="min-w-0">
        <slot />
      </div>

      <!-- Medals -->
      <div>
        <slot name="medals">
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-2">
              <Tooltip :text="completion.black_border ? 'Black Border' : 'CHIMPS'">
                <img
                  :src="completion.black_border
                    ? '/images/medals/medal_bb.webp'
                    : '/images/medals/medal_win.webp'"
                  class="w-[40px] h-[40px]"
                />
              </Tooltip>
              <Tooltip text="No Optimal Hero" :disabled="hideNoGeraldo">
                <img
                  src="/images/medals/medal_nogerry.webp"
                  class="w-[40px] h-[40px]"
                  :class="hideNoGeraldo ? 'opacity-0' : { 'medal-blocked': !completion.no_geraldo }"
                />
              </Tooltip>
              <Tooltip text="Current LCC" :disabled="!completion.is_current_lcc">
                <img
                  src="/images/medals/medal_lcc.webp"
                  class="w-[40px] h-[40px]"
                  :class="completion.is_current_lcc ? '' : 'opacity-0'"
                />
              </Tooltip>
            </div>
            <div v-if="formatInfo" class="flex items-center gap-1.5">
              <Badge :src="formatInfo.image" :alt="formatInfo.name" class="translate-y-0 scale-[125%] mr-1" />
              <span class="text-sm">{{ formatInfo.name }} ruleset</span>
            </div>
          </div>
        </slot>
      </div>

      <!-- Actions -->
      <div class="flex gap-1">
        <RouterLink v-if="showEdit" :to="editUrl!">
          <Button><i class="bi bi-pencil-fill" /></Button>
        </RouterLink>
        <Button @click="emit('toggleDetail')">
          <i class="bi bi-search" />
        </Button>
      </div>
    </div>

    <!-- Small screens: two rows -->
    <div class="md:hidden">
      <div class="flex items-center gap-2">
        <div class="flex-1 min-w-0">
          <slot />
        </div>
        <div class="flex gap-1 shrink-0">
          <RouterLink v-if="showEdit" :to="editUrl!">
            <Button><i class="bi bi-pencil-fill" /></Button>
          </RouterLink>
          <Button @click="emit('toggleDetail')">
            <i class="bi bi-search" />
          </Button>
        </div>
      </div>

      <div class="flex items-center gap-2 mt-2">
        <slot name="medals">
          <!-- Medals -->
          <div class="flex items-center gap-2">
            <Tooltip :text="completion.black_border ? 'Black Border' : 'CHIMPS'">
              <img
                :src="completion.black_border
                  ? '/images/medals/medal_bb.webp'
                  : '/images/medals/medal_win.webp'"
                class="w-[40px] h-[40px]"
              />
            </Tooltip>
            <Tooltip text="No Optimal Hero">
              <img
                src="/images/medals/medal_nogerry.webp"
                class="w-[40px] h-[40px]"
                :class="hideNoGeraldo ? 'opacity-0 pointer-events-none' : { 'medal-blocked': !completion.no_geraldo }"
              />
            </Tooltip>
            <Tooltip text="Current LCC">
              <img
                src="/images/medals/medal_lcc.webp"
                class="w-[40px] h-[40px]"
                :class="completion.is_current_lcc ? '' : 'opacity-0 pointer-events-none'"
              />
            </Tooltip>
          </div>

          <!-- Format ruleset -->
          <div v-if="formatInfo" class="flex-1 flex items-center gap-1.5">
            <Badge :src="formatInfo.image" :alt="formatInfo.name" class="translate-y-0 scale-[125%] mr-1" />
            <span class="text-sm">{{ formatInfo.name }} ruleset</span>
          </div>
        </slot>
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
