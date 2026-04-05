<script setup lang="ts">
import { computed, ref } from 'vue';
import { useTouchedProvider } from '@/composables/useTouchedFields';
import { useEmitOnChange } from '@/composables/useEmitOnChange';
import type { FormFieldError } from '@/services/api/formErrors';
import type { Format } from '@/services/api/formats/types';
import { FORMAT_ICONS } from '@/constants/formats';
import Button from '@/components/ui/Button.vue';
import ImageDrop from '@/components/ui/ImageDrop.vue';

export interface MapSubmissionFormModel {
  format_id: number | null;
  proposed_difficulty: string | null;
  proof_image: File | null;
  subm_notes: string;
}

const props = withDefaults(
  defineProps<{
    modelValue: MapSubmissionFormModel;
    disabled?: boolean;
    externalErrors?: FormFieldError[];
    eligibleFormats: Format[];
    proposedDifficulties: string[];
  }>(),
  {
    disabled: false,
    externalErrors: () => [],
    proposedDifficulties: () => [],
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: MapSubmissionFormModel): void;
  (e: 'errors', value: FormFieldError[]): void;
}>();

const { touchAll, clearTouched, isTouched, touch } = useTouchedProvider();
defineExpose({ touchAll, clearTouched });

const imageError = ref<string | null>(null);

function update(partial: Partial<MapSubmissionFormModel>) {
  for (const key of Object.keys(partial)) touch(key);
  emit('update:modelValue', { ...props.modelValue, ...partial });
}

function formatIcon(formatId: number): string | undefined {
  return FORMAT_ICONS.find((f) => f.id === formatId)?.image;
}

// --- Validation ---

const ownErrors = computed<FormFieldError[]>(() => {
  const errors: FormFieldError[] = [];

  if (props.eligibleFormats.length > 1 && props.modelValue.format_id == null) {
    errors.push({ path: 'format_id', message: 'Please select a list.', source: 'validation' });
  }

  if (props.modelValue.proof_image == null) {
    errors.push({ path: 'proof_image', message: 'A proof image is required.', source: 'validation' });
  }

  if (props.modelValue.subm_notes.length > 5000) {
    errors.push({ path: 'subm_notes', message: 'Notes must be 5000 characters or less.', source: 'validation' });
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
  <div class="flex flex-col gap-6">
    <!-- Proof Image -->
    <div>
      <label class="block font-bold mb-2">Proof of Completion</label>
      <ImageDrop
        :model-value="modelValue.proof_image"
        :disabled="disabled"
        @update:model-value="update({ proof_image: $event })"
        @error="imageError = $event"
      />
      <p v-if="fieldError('proof_image')" class="text-red-400 text-sm mt-1">
        {{ fieldError('proof_image') }}
      </p>
      <p v-else-if="imageError" class="text-red-400 text-sm mt-1">
        {{ imageError }}
      </p>
    </div>

    <!-- List Picker -->
    <div v-if="eligibleFormats.length > 1">
      <label class="block font-bold mb-1">Submit to</label>
      <p class="text-(--color-text-muted) text-sm mb-2">
        Select which list to submit this map to.
        Check the
        <template v-for="(fmt, i) in eligibleFormats" :key="fmt.id">
          <template v-if="i > 0">{{ i === eligibleFormats.length - 1 ? ' or ' : ', ' }}</template>
          <RouterLink
            :to="`/maps/${fmt.slug}/map-rules`"
            class="text-(--color-highlight) hover:text-(--color-active)"
          >{{ fmt.name }}</RouterLink>
        </template>
        map submission rules for details.
      </p>
      <div class="flex flex-wrap gap-2">
        <Button
          v-for="fmt in eligibleFormats"
          :key="fmt.id"
          :active="modelValue.format_id === fmt.id"
          :disabled="disabled"
          @click="update({ format_id: fmt.id })"
        >
          <span class="flex items-center gap-2">
            <img
              v-if="formatIcon(fmt.id)"
              :src="formatIcon(fmt.id)"
              :alt="fmt.name"
              class="w-5 h-5"
            />
            {{ fmt.name }}
          </span>
        </Button>
      </div>
      <p v-if="fieldError('format_id')" class="text-red-400 text-sm mt-1">
        {{ fieldError('format_id') }}
      </p>
    </div>

    <!-- Proposed Category -->
    <div v-if="proposedDifficulties.length > 0">
      <label for="proposed-difficulty" class="block font-bold mb-1">Proposed Category</label>
      <select
        id="proposed-difficulty"
        :value="modelValue.proposed_difficulty ?? ''"
        :disabled="disabled"
        class="w-full px-3 py-2 rounded-(--radius-btn) bg-(--color-primary) text-(--color-text) border border-(--color-contrast) focus:outline-none focus:border-(--color-active)"
        @change="update({ proposed_difficulty: ($event.target as HTMLSelectElement).value || null })"
      >
        <option value="" disabled>Select a category</option>
        <option v-for="diff in proposedDifficulties" :key="diff" :value="diff">
          {{ diff }}
        </option>
      </select>
    </div>

    <!-- Notes -->
    <div>
      <label for="subm-notes" class="block font-bold mb-1">
        Notes
        <span class="text-(--color-text-muted) font-normal">(optional)</span>
      </label>
      <textarea
        id="subm-notes"
        :value="modelValue.subm_notes"
        :disabled="disabled"
        maxlength="5000"
        rows="4"
        class="w-full px-3 py-2 rounded-(--radius-btn) bg-(--color-primary) text-(--color-text) border border-(--color-contrast) focus:outline-none focus:border-(--color-active) resize-y"
        :class="{ 'border-red-500!': fieldError('subm_notes') }"
        @input="update({ subm_notes: ($event.target as HTMLTextAreaElement).value })"
      />
      <div class="flex justify-between mt-1">
        <p v-if="fieldError('subm_notes')" class="text-red-400 text-sm">
          {{ fieldError('subm_notes') }}
        </p>
        <span class="text-(--color-text-muted) text-xs ml-auto">
          {{ modelValue.subm_notes.length }} / 5000
        </span>
      </div>
    </div>
  </div>
</template>
