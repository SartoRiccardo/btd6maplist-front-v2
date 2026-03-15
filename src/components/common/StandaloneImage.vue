<script setup lang="ts">
defineProps<{
  src: string;
  alt?: string | undefined;
}>();
</script>

<template>
  <img
    :src="src"
    :alt="alt ?? ''"
    class="w-full rounded-(--radius-panel) border-4 border-(--color-secondary) shadow-md"
  />
</template>
