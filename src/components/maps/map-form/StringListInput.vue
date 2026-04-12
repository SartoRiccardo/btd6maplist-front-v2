<script setup lang="ts">
import type { FormFieldError } from "@/services/api/formErrors";
import ListEditor from "@/components/ui/ListEditor.vue";

const props = withDefaults(
  defineProps<{
    modelValue: string[];
    disabled?: boolean;
    placeholder?: string;
    externalErrors?: FormFieldError[];
  }>(),
  { disabled: false, externalErrors: () => [] },
);

const emit = defineEmits<{
  "update:modelValue": [value: string[]];
}>();

function updateAt(index: number, value: string) {
  const next = [...props.modelValue];
  next[index] = value;
  emit("update:modelValue", next);
}

function fieldError(index: number): string | undefined {
  return props.externalErrors.find((e) => e.path === `${index}`)?.message;
}
</script>

<template>
  <ListEditor
    :model-value="modelValue"
    :default="''"
    :disabled="disabled"
    add-label="Add"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #item="{ item, index }">
      <div>
        <input
          type="text"
          :value="item"
          :disabled="disabled"
          :placeholder="placeholder"
          class="w-full px-3 py-2 rounded-(--radius-btn) bg-(--color-primary) text-(--color-text) border border-(--color-contrast) focus:outline-none focus:border-(--color-active)"
          :class="{ 'border-(--color-danger)!': fieldError(index) }"
          @input="updateAt(index, ($event.target as HTMLInputElement).value)"
        />
        <p v-if="fieldError(index)" class="text-(--color-danger) text-xs mt-1">
          {{ fieldError(index) }}
        </p>
      </div>
    </template>
  </ListEditor>
</template>
