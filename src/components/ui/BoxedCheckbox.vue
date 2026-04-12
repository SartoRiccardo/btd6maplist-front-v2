<script setup lang="ts">
defineProps<{
  modelValue: boolean;
  disabled?: boolean;
  locked?: boolean;
  label: string;
  icon?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();
</script>

<template>
  <label
    class="flex items-center gap-2 w-full px-4 py-2 rounded-(--radius-panel) border transition-colors"
    :class="[
      disabled
        ? 'border-(--color-contrast)/50 opacity-50 cursor-not-allowed'
        : locked
          ? 'border-(--color-highlight) bg-(--color-highlight)/10 cursor-not-allowed'
          : modelValue
            ? 'border-(--color-highlight) bg-(--color-highlight)/10 cursor-pointer'
            : 'border-(--color-contrast) hover:border-(--color-active) cursor-pointer',
    ]"
  >
    <input
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled || locked"
      class="accent-(--color-highlight) w-4 h-4"
      @change="
        emit('update:modelValue', ($event.target as HTMLInputElement).checked)
      "
    />
    <span></span>
    <i
      v-if="locked"
      class="bi bi-lock-fill text-(--color-text-muted) text-sm"
    />
    <img v-if="icon" :src="icon" :alt="label" class="w-5 h-5" />
    <span>{{ label }}</span>
  </label>
</template>
