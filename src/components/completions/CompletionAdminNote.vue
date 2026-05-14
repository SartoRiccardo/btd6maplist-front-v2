<script setup lang="ts">
defineProps<{ note: string }>();
</script>

<template>
  <div
    class="flex items-start gap-2 px-4 py-3 rounded-(--radius-panel) border border-amber-500/50 bg-amber-500/10 text-amber-400 text-sm"
  >
    <i class="bi bi-exclamation-triangle-fill mt-0.5 shrink-0" />
    <p class="mb-0">
      <span class="font-bold">Admin note:</span> {{ note }}
    </p>
  </div>
</template>
