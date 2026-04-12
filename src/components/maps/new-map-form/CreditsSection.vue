<script setup lang="ts">
import { ref } from "vue";
import { useTouchedFields } from "@/composables/useTouchedFields";
import { useEmitOnChange } from "@/composables/useEmitOnChange";
import type { FormFieldError } from "@/services/api/formErrors";
import type { CreditsSlice } from "./types";
import CreatorsInput from "./CreatorsInput.vue";
import VerifiersInput from "./VerifiersInput.vue";

const props = withDefaults(
  defineProps<{
    modelValue: CreditsSlice;
    disabled?: boolean;
    externalErrors?: FormFieldError[];
  }>(),
  { disabled: false, externalErrors: () => [] },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: CreditsSlice): void;
  (e: "errors", value: FormFieldError[]): void;
}>();

const { touch } = useTouchedFields();

function update(partial: Partial<CreditsSlice>) {
  for (const key of Object.keys(partial)) touch(key);
  emit("update:modelValue", { ...props.modelValue, ...partial });
}

// --- Error aggregation from children ---

const childErrors = ref<FormFieldError[]>([]);

function handleVerifierErrors(errors: FormFieldError[]) {
  childErrors.value = errors;
}

function verifierExternalErrors(): FormFieldError[] {
  return (props.externalErrors ?? []).filter((e) =>
    e.path.startsWith("verifiers."),
  );
}

useEmitOnChange(childErrors, (errors) => emit("errors", errors));
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Creators -->
    <div>
      <label class="block font-bold mb-2">Creators</label>
      <CreatorsInput
        :model-value="modelValue.creators"
        :disabled="disabled"
        @update:model-value="update({ creators: $event })"
      />
    </div>

    <!-- Verifiers -->
    <div>
      <label class="block font-bold mb-2">Verifiers</label>
      <VerifiersInput
        :model-value="modelValue.verifiers"
        :disabled="disabled"
        :external-errors="verifierExternalErrors()"
        @update:model-value="update({ verifiers: $event })"
        @errors="handleVerifierErrors"
      />
    </div>
  </div>
</template>
