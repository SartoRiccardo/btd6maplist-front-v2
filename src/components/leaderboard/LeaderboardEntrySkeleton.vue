<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ placement: number }>();

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
    class="flex items-center my-2 px-4 py-2 rounded-(--radius-panel) animate-pulse"
    :class="isTopThree ? 'font-border' : 'bg-(--color-secondary)'"
    :style="positionColor ? { backgroundColor: positionColor } : undefined"
  >
    <div class="w-12 shrink-0 text-center">
      <div class="h-6 w-8 bg-(--color-primary) rounded mx-auto" />
    </div>

    <div class="flex-1 min-w-0">
      <div class="flex items-center my-1.5">
        <div class="w-[45px] h-[45px] bg-(--color-primary) rounded-sm shrink-0" />
        <div class="pl-2">
          <div class="h-4 w-24 bg-(--color-primary) rounded" />
        </div>
      </div>
    </div>

    <div class="shrink-0 text-right">
      <div class="h-6 w-16 bg-(--color-primary) rounded" />
    </div>
  </div>
</template>
