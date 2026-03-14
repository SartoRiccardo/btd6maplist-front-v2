<script setup lang="ts">
defineProps<{
  to: string;
}>();
</script>

<template>
  <RouterLink
    :to="to"
    class="inline-block px-4 py-2 bg-(--color-contrast) text-(--color-text)! font-bold font-border rounded-(--radius-btn) no-underline! hover:bg-(--color-active)! transition-colors! duration-200"
  >
    <slot />
  </RouterLink>
</template>
