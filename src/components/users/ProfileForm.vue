<script setup lang="ts">
import { computed } from 'vue';
import { useTouchedProvider } from '@/composables/useTouchedFields';
import { useEmitOnChange } from '@/composables/useEmitOnChange';
import type { FormFieldError } from '@/services/api/formErrors';

export interface ProfileFormModel {
  name: string;
  nk_oak: string;
}

const props = withDefaults(
  defineProps<{
    modelValue: ProfileFormModel;
    disabled?: boolean;
    externalErrors?: FormFieldError[];
  }>(),
  { disabled: false, externalErrors: () => [] },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: ProfileFormModel): void;
  (e: 'errors', value: FormFieldError[]): void;
}>();

const { touchAll, clearTouched, isTouched, touch } = useTouchedProvider();
defineExpose({ touchAll, clearTouched });

function update(partial: Partial<ProfileFormModel>) {
  for (const key of Object.keys(partial)) touch(key);
  emit('update:modelValue', { ...props.modelValue, ...partial });
}

const ownErrors = computed<FormFieldError[]>(() => {
  const errors: FormFieldError[] = [];
  if (!props.modelValue.name.trim()) {
    errors.push({ path: 'name', message: 'Display name is required.', source: 'validation' });
  } else if (props.modelValue.name.length > 50) {
    errors.push({ path: 'name', message: 'Display name must be 50 characters or less.', source: 'validation' });
  }
  return errors;
});

const activeErrors = computed<FormFieldError[]>(() => {
  const validation = ownErrors.value.filter((e) => isTouched(e.path));
  const externalValidation = (props.externalErrors ?? []).filter(
    (e) => e.source === 'validation' && isTouched(e.path),
  );
  const externalApi = (props.externalErrors ?? []).filter(
    (e) => e.source === 'api' && !isTouched(e.path),
  );
  return [...validation, ...externalValidation, ...externalApi];
});

useEmitOnChange(activeErrors, (errors) => emit('errors', errors));

function fieldError(field: string): string | undefined {
  return activeErrors.value.find((e) => e.path === field)?.message;
}
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
    <!-- Display Name -->
    <div>
      <label for="profile-name" class="block font-bold mb-1">Display Name</label>
      <input
        id="profile-name"
        type="text"
        :value="modelValue.name"
        :disabled="disabled"
        maxlength="50"
        class="w-full px-3 py-2 rounded-(--radius-btn) bg-(--color-primary) text-(--color-text) border border-(--color-contrast) focus:outline-none focus:border-(--color-active)"
        :class="{ 'border-red-500!': fieldError('name') }"
        @input="update({ name: ($event.target as HTMLInputElement).value })"
      />
      <p v-if="fieldError('name')" class="text-red-400 text-sm mt-1">
        {{ fieldError('name') }}
      </p>
    </div>

    <!-- Ninja Kiwi Open API Key -->
    <div>
      <label for="profile-nk-oak" class="block font-bold mb-1">Ninja Kiwi Open API Key</label>
      <input
        id="profile-nk-oak"
        type="text"
        :value="modelValue.nk_oak"
        :disabled="disabled"
        class="w-full px-3 py-2 rounded-(--radius-btn) bg-(--color-primary) text-(--color-text) border border-(--color-contrast) focus:outline-none focus:border-(--color-active)"
        :class="{ 'border-red-500!': fieldError('nk_oak') }"
        @input="update({ nk_oak: ($event.target as HTMLInputElement).value })"
      />
      <p v-if="fieldError('nk_oak')" class="text-red-400 text-sm mt-1">
        {{ fieldError('nk_oak') }}
      </p>
    </div>
  </div>
</template>
