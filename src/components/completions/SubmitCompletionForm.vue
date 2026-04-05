<script setup lang="ts">
import { computed, ref } from 'vue';
import { useTouchedProvider } from '@/composables/useTouchedFields';
import { useEmitOnChange } from '@/composables/useEmitOnChange';
import type { FormFieldError } from '@/services/api/formErrors';
import type { Format } from '@/services/api/formats/types';
import { FORMAT_ICONS } from '@/constants/formats';
import Button from '@/components/ui/Button.vue';
import BoxedCheckbox from '@/components/ui/BoxedCheckbox.vue';
import ProofImageUploader from './ProofImageUploader.vue';
import UrlListInput from './UrlListInput.vue';

export interface CompletionFormModel {
  format_id: number | null;
  proof_images: File[];
  black_border: boolean;
  no_geraldo: boolean;
  subm_notes: string;
  proof_videos: string[];
  lcc_enabled: boolean;
  lcc_leftover: number | null;
}

const props = withDefaults(
  defineProps<{
    modelValue: CompletionFormModel;
    disabled?: boolean;
    externalErrors?: FormFieldError[];
    eligibleFormats: Format[];
    videoRequired?: boolean;
    lccOnly?: boolean;
    noGeraldoEnabled?: boolean;
  }>(),
  {
    disabled: false,
    externalErrors: () => [],
    videoRequired: false,
    lccOnly: false,
    noGeraldoEnabled: false,
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: CompletionFormModel): void;
  (e: 'errors', value: FormFieldError[]): void;
}>();

const { touchAll, clearTouched, isTouched, touch } = useTouchedProvider();
defineExpose({ touchAll, clearTouched });

const imageError = ref<string | null>(null);

function update(partial: Partial<CompletionFormModel>) {
  for (const key of Object.keys(partial)) touch(key);
  emit('update:modelValue', { ...props.modelValue, ...partial });
}

function formatIcon(formatId: number): string | undefined {
  return FORMAT_ICONS.find((f) => f.id === formatId)?.image;
}

// --- Validation ---

function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

const ownErrors = computed<FormFieldError[]>(() => {
  const errors: FormFieldError[] = [];

  if (props.eligibleFormats.length > 1 && props.modelValue.format_id == null) {
    errors.push({ path: 'format_id', message: 'Please select a format.', source: 'validation' });
  }

  if (props.modelValue.proof_images.length === 0) {
    errors.push({ path: 'proof_images', message: 'At least one proof image is required.', source: 'validation' });
  }

  if (props.modelValue.subm_notes.length > 5000) {
    errors.push({ path: 'subm_notes', message: 'Notes must be 5000 characters or less.', source: 'validation' });
  }

  const nonEmptyVideos = props.modelValue.proof_videos.filter((v) => v.trim() !== '');
  if (props.videoRequired && nonEmptyVideos.length === 0) {
    errors.push({ path: 'proof_videos', message: 'At least one video URL is required.', source: 'validation' });
  }
  for (const url of nonEmptyVideos) {
    if (!isValidUrl(url)) {
      errors.push({ path: 'proof_videos', message: `"${url}" is not a valid URL.`, source: 'validation' });
      break;
    }
  }

  if (props.modelValue.lcc_enabled && (props.modelValue.lcc_leftover == null || props.modelValue.lcc_leftover < 0)) {
    errors.push({ path: 'lcc_leftover', message: 'LCC leftover must be a non-negative number.', source: 'validation' });
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
    <!-- Proof Images -->
    <div>
      <label class="block font-bold mb-2">Proof Images</label>
      <ProofImageUploader
        :model-value="modelValue.proof_images"
        :disabled="disabled"
        @update:model-value="update({ proof_images: $event })"
        @error="imageError = $event"
      />
      <p v-if="fieldError('proof_images')" class="text-red-400 text-sm mt-1">
        {{ fieldError('proof_images') }}
      </p>
      <p v-else-if="imageError" class="text-red-400 text-sm mt-1">
        {{ imageError }}
      </p>
    </div>

    <!-- Proof Videos -->
    <UrlListInput
      :model-value="modelValue.proof_videos"
      :disabled="disabled"
      :required="videoRequired"
      label="Proof Videos"
      :max="10"
      @update:model-value="update({ proof_videos: $event })"
    />
    <p v-if="fieldError('proof_videos')" class="text-red-400 text-sm -mt-4">
      {{ fieldError('proof_videos') }}
    </p>

    <!-- List Ruleset Picker -->
    <div v-if="eligibleFormats.length > 1">
      <label class="block font-bold mb-1">List Ruleset</label>
      <p class="text-(--color-text-muted) text-sm mb-2">
        This map is in multiple lists which may have different rulesets.
        Please specify which list's ruleset you followed.
        Check the
        <template v-for="(fmt, i) in eligibleFormats" :key="fmt.id">
          <template v-if="i > 0">{{ i === eligibleFormats.length - 1 ? ' or ' : ', ' }}</template>
          <RouterLink
            :to="`/maps/${fmt.slug}/completion-rules`"
            class="text-(--color-highlight) hover:text-(--color-active)"
          >{{ fmt.name }}</RouterLink>
        </template>
        completion rules for details.
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

    <!-- Run Modifiers -->
    <div>
      <label class="block font-bold mb-2">Run Modifiers</label>
      <div class="flex flex-col gap-3">
        <BoxedCheckbox
          :model-value="modelValue.black_border"
          :disabled="disabled"
          label="Black Border"
          icon="/images/medals/medal_bb.webp"
          @update:model-value="update({ black_border: $event })"
        />

        <BoxedCheckbox
          :model-value="modelValue.no_geraldo"
          :disabled="disabled"
          label="No Optimal Hero"
          icon="/images/medals/medal_nogerry.webp"
          @update:model-value="update({ no_geraldo: $event })"
        />

        <div>
          <BoxedCheckbox
            :model-value="modelValue.lcc_enabled"
            :disabled="disabled"
            :locked="lccOnly"
            label="LCC (Least Cash CHIMPS)"
            icon="/images/medals/medal_lcc.webp"
            @update:model-value="update({ lcc_enabled: $event })"
          />

          <div v-if="modelValue.lcc_enabled" class="mt-2 ml-6">
            <label for="lcc-leftover" class="block text-sm mb-1">Leftover cash</label>
            <input
              id="lcc-leftover"
              type="number"
              min="0"
              :value="modelValue.lcc_leftover"
              :disabled="disabled"
              class="w-40 px-3 py-2 rounded-(--radius-btn) bg-(--color-primary) text-(--color-text) border border-(--color-contrast) focus:outline-none focus:border-(--color-active)"
              :class="{ 'border-red-500!': fieldError('lcc_leftover') }"
              @input="update({ lcc_leftover: ($event.target as HTMLInputElement).valueAsNumber })"
            />
            <p v-if="fieldError('lcc_leftover')" class="text-red-400 text-sm mt-1">
              {{ fieldError('lcc_leftover') }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Submission Notes -->
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
