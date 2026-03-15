<script setup lang="ts">
defineProps<{
  to: string;
  active?: boolean;
}>();
</script>

<template>
  <RouterLink
    :to="to"
    class="inline-block px-3 py-1.5 font-bold font-border-active rounded-(--radius-btn) no-underline! transition-colors! duration-200"
    :class="active
      ? 'bg-(--color-highlight) text-(--color-text-active)!'
      : 'bg-(--color-contrast) text-(--color-text-active)! hover:bg-(--color-active)!'"
  >
    <slot />
  </RouterLink>
</template>
