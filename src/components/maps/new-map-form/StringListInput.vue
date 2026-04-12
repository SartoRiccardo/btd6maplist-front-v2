<script setup lang="ts">
import ListEditor from "@/components/ui/ListEditor.vue";

const props = defineProps<{
  modelValue: string[];
  disabled?: boolean;
  placeholder?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string[]];
}>();

function updateAt(index: number, value: string) {
  const next = [...props.modelValue];
  next[index] = value;
  emit("update:modelValue", next);
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
      <input
        type="text"
        :value="item"
        :disabled="disabled"
        :placeholder="placeholder"
        class="w-full px-3 py-2 rounded-(--radius-btn) bg-(--color-primary) text-(--color-text) border border-(--color-contrast) focus:outline-none focus:border-(--color-active)"
        @input="updateAt(index, ($event.target as HTMLInputElement).value)"
      />
    </template>
  </ListEditor>
</template>
