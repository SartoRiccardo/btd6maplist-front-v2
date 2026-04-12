<script setup lang="ts">
import { ref, computed } from "vue";
import { useTouchedFields } from "@/composables/useTouchedFields";
import { useEmitOnChange } from "@/composables/useEmitOnChange";
import type { FormFieldError } from "@/services/api/formErrors";
import type { User } from "@/services/api/users/types";
import type { CreditsSlice } from "./types";
import CreatorsInput from "./CreatorsInput.vue";
import VerifiersInput from "./VerifiersInput.vue";

const props = withDefaults(
  defineProps<{
    modelValue: CreditsSlice;
    disabled?: boolean;
    externalErrors?: FormFieldError[];
    initialCreatorUsers?: User[];
    initialVerifierUsers?: User[];
  }>(),
  {
    disabled: false,
    externalErrors: () => [],
    initialCreatorUsers: () => [],
    initialVerifierUsers: () => [],
  },
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

const childErrorMap = ref<Map<string, FormFieldError[]>>(new Map());

function handleChildErrors(childId: string, errors: FormFieldError[]) {
  const map = new Map(childErrorMap.value);
  if (errors.length === 0) map.delete(childId);
  else map.set(childId, errors);
  childErrorMap.value = map;
}

const flatErrors = computed<FormFieldError[]>(() => {
  const result: FormFieldError[] = [];
  for (const [, errors] of childErrorMap.value) result.push(...errors);
  return result;
});

useEmitOnChange(flatErrors, (errors) => emit("errors", errors));

function externalErrorsFor(prefix: string): FormFieldError[] {
  return (props.externalErrors ?? []).filter((e) =>
    e.path.startsWith(`${prefix}.`),
  );
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Creators -->
    <div>
      <label class="block font-bold mb-2">Creators</label>
      <CreatorsInput
        :model-value="modelValue.creators"
        :disabled="disabled"
        :external-errors="externalErrorsFor('creators')"
        :initial-users="initialCreatorUsers"
        @update:model-value="update({ creators: $event })"
        @errors="handleChildErrors('creators', $event)"
      />
    </div>

    <!-- Verifiers -->
    <div>
      <label class="block font-bold mb-2">Verifiers</label>
      <VerifiersInput
        :model-value="modelValue.verifiers"
        :disabled="disabled"
        :external-errors="externalErrorsFor('verifiers')"
        :initial-users="initialVerifierUsers"
        @update:model-value="update({ verifiers: $event })"
        @errors="handleChildErrors('verifiers', $event)"
      />
    </div>
  </div>
</template>
