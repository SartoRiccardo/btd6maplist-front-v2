<script setup lang="ts">
import { computed } from "vue";
import { useTouchedFields } from "@/composables/useTouchedFields";
import { useEmitOnChange } from "@/composables/useEmitOnChange";
import type { FormFieldError } from "@/services/api/formErrors";
import ImageDrop from "@/components/ui/ImageDrop.vue";
import type { MapInfoSlice } from "./types";
import R6StartInput from "./R6StartInput.vue";
import StringListInput from "./StringListInput.vue";
import AdditionalCodesInput from "./AdditionalCodesInput.vue";

const props = withDefaults(
  defineProps<{
    modelValue: MapInfoSlice;
    disabled?: boolean;
    externalErrors?: FormFieldError[];
  }>(),
  { disabled: false, externalErrors: () => [] },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: MapInfoSlice): void;
  (e: "errors", value: FormFieldError[]): void;
}>();

const { isTouched, touch } = useTouchedFields();

function update(partial: Partial<MapInfoSlice>) {
  for (const key of Object.keys(partial)) touch(key);
  emit("update:modelValue", { ...props.modelValue, ...partial });
}

// --- Validation ---

const ownErrors = computed<FormFieldError[]>(() => {
  const errors: FormFieldError[] = [];
  if (!props.modelValue.name.trim()) {
    errors.push({
      path: "name",
      message: "Map name is required.",
      source: "validation",
    });
  }
  return errors;
});

const activeErrors = computed<FormFieldError[]>(() => {
  const validation = ownErrors.value.filter((e) => isTouched(e.path));
  const externalValidation = (props.externalErrors ?? []).filter(
    (e) => e.source === "validation" && isTouched(e.path),
  );
  const externalApi = (props.externalErrors ?? []).filter(
    (e) => e.source === "api" && !isTouched(e.path),
  );
  return [...validation, ...externalValidation, ...externalApi];
});

useEmitOnChange(activeErrors, (errors) => emit("errors", errors));

function fieldError(field: string): string | undefined {
  return activeErrors.value.find((e) => e.path === field)?.message;
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Name -->
    <div>
      <label for="map-name" class="block font-bold mb-2">Name</label>
      <input
        id="map-name"
        type="text"
        :value="modelValue.name"
        :disabled="disabled"
        placeholder="Map name"
        class="w-full px-3 py-2 rounded-(--radius-btn) bg-(--color-primary) text-(--color-text) border border-(--color-contrast) focus:outline-none focus:border-(--color-active)"
        :class="{ 'border-red-500!': fieldError('name') }"
        @input="update({ name: ($event.target as HTMLInputElement).value })"
      />
      <p v-if="fieldError('name')" class="text-red-400 text-sm mt-1">
        {{ fieldError("name") }}
      </p>
    </div>

    <!-- Preview Image + Round 6 Start -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div>
        <label class="block font-bold mb-2">Custom Preview Image</label>
        <p class="text-(--color-text-muted) pb-3 pt-2">
          If none, the site will display the image from the game.
        </p>
        <ImageDrop
          :model-value="modelValue.custom_map_preview_file"
          :disabled="disabled"
          placeholder="Drop image here or click to browse"
          @update:model-value="update({ custom_map_preview_file: $event })"
        />
      </div>

      <div>
        <label class="block font-bold mb-2">Round 6 Start</label>
        <R6StartInput
          :r6-start="modelValue.r6_start"
          :r6-start-file="modelValue.r6_start_file"
          :disabled="disabled"
          @update="
            touch('r6_start');
            touch('r6_start_file');
            update($event);
          "
        />
      </div>
    </div>

    <!-- Aliases -->
    <div>
      <label class="block font-bold mb-2">Aliases</label>
      <StringListInput
        :model-value="modelValue.aliases"
        :disabled="disabled"
        placeholder="Alias"
        @update:model-value="update({ aliases: $event })"
      />
    </div>

    <!-- Additional Codes -->
    <div>
      <label class="block font-bold mb-2">Additional Codes</label>
      <AdditionalCodesInput
        :model-value="modelValue.additional_codes"
        :disabled="disabled"
        @update:model-value="update({ additional_codes: $event })"
      />
    </div>
  </div>
</template>
