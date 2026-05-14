<script setup lang="ts">
import { ref } from "vue";

defineProps<{
  modelValue: string;
  disabled?: boolean;
  error?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const visible = ref(false);
</script>

<template>
  <div
    class="flex w-full rounded-(--radius-btn) bg-(--color-primary) border transition-colors focus-within:border-(--color-active)"
    :class="error ? 'border-(--color-danger)!' : 'border-(--color-contrast)'"
  >
    <input
      :type="visible ? 'text' : 'password'"
      :value="modelValue"
      :disabled="disabled"
      class="flex-1 min-w-0 px-3 py-2 bg-transparent text-(--color-text) focus:outline-none disabled:opacity-50"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <button
      type="button"
      :disabled="disabled"
      class="px-3 border-l border-(--color-contrast) text-(--color-text-muted) hover:text-(--color-text) transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
      @click="visible = !visible"
    >
      <i :class="visible ? 'bi bi-eye-slash' : 'bi bi-eye'" />
    </button>
  </div>
</template>
