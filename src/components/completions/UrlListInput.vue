<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: string[];
    disabled?: boolean;
    required?: boolean;
    label?: string;
    max?: number;
  }>(),
  {
    disabled: false,
    required: false,
    max: 10,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string[]];
}>();

function updateAt(index: number, value: string) {
  const next = [...props.modelValue];
  next[index] = value;
  emit("update:modelValue", next);
}

function removeAt(index: number) {
  const next = [...props.modelValue];
  next.splice(index, 1);
  emit("update:modelValue", next);
}

function addUrl() {
  emit("update:modelValue", [...props.modelValue, ""]);
}
</script>

<template>
  <div>
    <label v-if="label" class="block font-bold mb-1">
      {{ label }}
      <span v-if="required" class="text-(--color-highlight) font-normal"
        >(required)</span
      >
      <span v-else class="text-(--color-text-muted) font-normal"
        >(optional)</span
      >
    </label>

    <div class="flex flex-col gap-2">
      <div v-for="(url, i) in modelValue" :key="i" class="flex gap-2">
        <input
          type="url"
          :value="url"
          :disabled="disabled"
          placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          class="flex-1 px-3 py-2 rounded-(--radius-btn) bg-(--color-primary) text-(--color-text) border border-(--color-contrast) focus:outline-none focus:border-(--color-active)"
          @input="updateAt(i, ($event.target as HTMLInputElement).value)"
        />
        <button
          v-if="modelValue.length > 1"
          type="button"
          :disabled="disabled"
          class="px-2 py-2 rounded-(--radius-btn) text-(--color-text-muted) hover:text-red-400 transition-colors disabled:opacity-50"
          @click="removeAt(i)"
        >
          <i class="bi bi-trash" />
        </button>
      </div>
    </div>

    <button
      v-if="modelValue.length < max"
      type="button"
      :disabled="disabled"
      class="mt-2 text-sm text-(--color-highlight) hover:text-(--color-active) transition-colors disabled:opacity-50"
      @click="addUrl"
    >
      <i class="bi bi-plus-lg" /> Add URL
    </button>
  </div>
</template>
