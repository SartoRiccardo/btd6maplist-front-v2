<script setup lang="ts" generic="T">
import Button from "@/components/ui/Button.vue";

const props = withDefaults(
  defineProps<{
    modelValue: T[];
    default: T;
    disabled?: boolean;
    addLabel?: string;
    minItems?: number;
  }>(),
  { disabled: false, addLabel: "Add", minItems: 0 },
);

const emit = defineEmits<{
  "update:modelValue": [value: T[]];
}>();

function add() {
  emit("update:modelValue", [
    ...props.modelValue,
    structuredClone(props.default),
  ]);
}

function removeAt(index: number) {
  emit(
    "update:modelValue",
    props.modelValue.filter((_, i) => i !== index),
  );
}
</script>

<template>
  <div class="flex flex-col gap-4 sm:gap-2">
    <div
      v-for="(item, i) in modelValue"
      :key="i"
      class="flex items-start gap-2"
    >
      <div class="flex-1">
        <slot name="item" :item="item" :index="i" />
      </div>
      <button
        v-if="!disabled && modelValue.length > minItems"
        type="button"
        class="mt-2 text-(--color-text-muted) hover:text-red-400 transition-colors cursor-pointer"
        @click="removeAt(i)"
      >
        <i class="bi bi-trash" />
      </button>
    </div>

    <Button v-if="!disabled" @click="add">
      <i class="bi bi-plus-lg" /> {{ addLabel }}
    </Button>
  </div>
</template>
