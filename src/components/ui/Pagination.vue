<script setup lang="ts">
import Button from './Button.vue';

const props = defineProps<{
  currentPage: number;
  lastPage: number;
  disabled?: boolean | undefined;
}>();

const emit = defineEmits<{
  'update:currentPage': [page: number];
}>();

function goTo(page: number) {
  if (page >= 1 && page <= props.lastPage && page !== props.currentPage) {
    emit('update:currentPage', page);
  }
}
</script>

<template>
  <nav v-if="lastPage > 1" class="flex justify-center items-center gap-1 my-4">
    <Button :disabled="disabled || currentPage === 1" @click="goTo(1)">
      <i class="bi bi-chevron-double-left" />
    </Button>

    <Button :disabled="disabled || currentPage === 1" @click="goTo(currentPage - 1)">
      <i class="bi bi-chevron-left" />
    </Button>

    <span class="px-3 py-1.5 font-bold font-border">
      {{ currentPage }} / {{ lastPage }}
    </span>

    <Button :disabled="disabled || currentPage === lastPage" @click="goTo(currentPage + 1)">
      <i class="bi bi-chevron-right" />
    </Button>

    <Button :disabled="disabled || currentPage === lastPage" @click="goTo(lastPage)">
      <i class="bi bi-chevron-double-right" />
    </Button>
  </nav>
</template>
