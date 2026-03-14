<script setup lang="ts">
import { computed } from 'vue';
import type { User } from '@/services/api/users/types';
import Icon from '@/components/common/Icon.vue';
import UserEntry from '@/components/users/UserEntry.vue';

const props = defineProps<{
  placement: number;
  score: number;
  suffixIcon: string | undefined;
  suffixText: string | undefined;
  user: User;
}>();

const positionColor = computed(() => {
  if (props.placement === 1) return '#ffd54f';
  if (props.placement === 2) return '#e0e0e0';
  if (props.placement === 3) return '#cd7f32';
  return undefined;
});

const isTopThree = computed(() => props.placement <= 3);
</script>

<template>
  <div
    class="flex items-center my-2 px-4 py-2 rounded-(--radius-panel)"
    :class="isTopThree ? 'font-border' : 'bg-(--color-secondary)'"
    :style="positionColor ? { backgroundColor: positionColor } : undefined"
  >
    <div class="w-12 shrink-0 text-center">
      <span class="text-xl font-bold">#{{ placement }}</span>
    </div>

    <div class="flex-1 min-w-0">
      <UserEntry :user="user" centered />
    </div>

    <div class="shrink-0 text-right">
      <span class="text-xl font-bold">
        {{ score }}
        <template v-if="suffixText"> {{ suffixText }}</template>
        <Icon v-if="suffixIcon" :src="suffixIcon" class="ml-2" />
      </span>
    </div>
  </div>
</template>
