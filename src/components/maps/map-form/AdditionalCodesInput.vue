<script setup lang="ts">
import { computed } from "vue";
import type { FormFieldError } from "@/services/api/formErrors";
import ListEditor from "@/components/ui/ListEditor.vue";
import type { AdditionalCode } from "./types";

const props = withDefaults(
  defineProps<{
    modelValue: AdditionalCode[];
    disabled?: boolean;
    externalErrors?: FormFieldError[];
  }>(),
  { disabled: false, externalErrors: () => [] },
);

const emit = defineEmits<{
  "update:modelValue": [value: AdditionalCode[]];
}>();

function updateAt(index: number, partial: Partial<AdditionalCode>) {
  const next = [...props.modelValue];
  next[index] = { ...next[index]!, ...partial };
  emit("update:modelValue", next);
}

function fieldError(index: number, field: string): string | undefined {
  return props.externalErrors.find(
    (e) => e.path === `${index}.${field}`,
  )?.message;
}
</script>

<template>
  <ListEditor
    :model-value="modelValue"
    :default="{ code: '', description: '' } as AdditionalCode"
    :disabled="disabled"
    add-label="Add Code"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #item="{ item, index }">
      <div class="flex flex-col gap-1">
        <div class="flex gap-2">
          <input
            type="text"
            :value="item.code"
            :disabled="disabled"
            placeholder="Code"
            class="w-32 px-3 py-2 rounded-(--radius-btn) bg-(--color-primary) text-(--color-text) border border-(--color-contrast) focus:outline-none focus:border-(--color-active) uppercase"
            :class="{ 'border-(--color-danger)!': fieldError(index, 'code') }"
            @input="
              updateAt(index, {
                code: ($event.target as HTMLInputElement).value,
              })
            "
          />
          <input
            type="text"
            :value="item.description"
            :disabled="disabled"
            placeholder="Description"
            class="flex-1 px-3 py-2 rounded-(--radius-btn) bg-(--color-primary) text-(--color-text) border border-(--color-contrast) focus:outline-none focus:border-(--color-active)"
            :class="{ 'border-(--color-danger)!': fieldError(index, 'description') }"
            @input="
              updateAt(index, {
                description: ($event.target as HTMLInputElement).value,
              })
            "
          />
        </div>
        <p
          v-if="fieldError(index, 'code') || fieldError(index, 'description')"
          class="text-(--color-danger) text-xs"
        >
          {{ fieldError(index, "code") || fieldError(index, "description") }}
        </p>
      </div>
    </template>
  </ListEditor>
</template>
