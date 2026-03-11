<script setup lang="ts">
interface Props {
  isOpen: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  open: [];
}>();
</script>

<template>
  <div class="lg:hidden">
    <!-- Hamburger button -->
    <button
      @click="emit('open')"
      class="flex items-center no-underline text-(--color-text)! transition-colors duration-200 ease rounded-xl px-4 py-2 hover:cursor-pointer bg-(--color-secondary)"
      aria-label="Toggle menu"
    >
      <i class="bi bi-list text-xl"></i>
    </button>
  </div>
</template>
