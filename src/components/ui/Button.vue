<script setup lang="ts">
defineProps<{
  active?: boolean;
  disabled?: boolean;
  danger?: boolean;
}>();

defineEmits<{
  click: [];
}>();
</script>

<template>
  <button
    type="button"
    class="px-3 py-1.5 rounded-(--radius-btn) font-bold font-border-active transition-colors! duration-200"
    :class="
      disabled
        ? 'bg-(--color-secondary) text-(--color-text-muted) cursor-not-allowed opacity-50'
        : active
          ? 'bg-(--color-highlight) text-(--color-text-active) cursor-pointer'
          : danger
            ? 'bg-(--color-danger) text-white hover:opacity-80 cursor-pointer'
            : 'bg-(--color-contrast) text-(--color-text-active) hover:bg-(--color-active) cursor-pointer'
    "
    :disabled="disabled"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>
