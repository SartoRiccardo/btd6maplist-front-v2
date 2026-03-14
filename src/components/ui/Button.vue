<script setup lang="ts">
defineProps<{
  active?: boolean;
  disabled?: boolean;
}>();

defineEmits<{
  click: [];
}>();
</script>

<template>
  <button
    class="px-3 py-1.5 rounded-(--radius-btn) font-bold font-border transition-colors! duration-200 cursor-pointer"
    :class="disabled
      ? 'bg-(--color-secondary) text-(--color-text-muted) cursor-not-allowed opacity-50'
      : active
        ? 'bg-(--color-highlight) text-(--color-text)'
        : 'bg-(--color-contrast) text-(--color-text) hover:bg-(--color-active)'"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>
