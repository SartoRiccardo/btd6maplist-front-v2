<script setup lang="ts">
defineProps<{ note: string }>();
defineEmits<{ delete: [] }>();
</script>

<template>
  <div
    class="flex items-start gap-2 px-4 py-3 rounded-(--radius-panel) border border-(--color-warn-border) bg-(--color-warn-muted) text-(--color-warn) text-sm"
  >
    <i class="bi bi-exclamation-triangle-fill shrink-0" />
    <p class="mb-0 flex-1">
      {{ note }}
    </p>
    <button
      type="button"
      class="shrink-0 hover:text-(--color-danger) transition-colors cursor-pointer"
      @click="$emit('delete')"
    >
      <i class="bi bi-trash" />
    </button>
  </div>
</template>
