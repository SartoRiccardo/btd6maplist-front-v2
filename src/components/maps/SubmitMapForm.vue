<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useFilter } from "reka-ui";
import { useTouchedProvider } from "@/composables/useTouchedFields";
import { useEmitOnChange } from "@/composables/useEmitOnChange";
import type { FormFieldError } from "@/services/api/formErrors";
import type { Format } from "@/services/api/formats/types";
import { FORMAT_ICONS, FORMAT_NOSTALGIA_PACK } from "@/constants/formats";
import { getRetroMaps } from "@/services/api/retro-maps";
import Button from "@/components/ui/Button.vue";
import ImageDrop from "@/components/ui/ImageDrop.vue";
import AsyncSelect from "@/components/ui/AsyncSelect.vue";
import UrlListInput from "@/components/completions/UrlListInput.vue";

interface ProposedOption {
  index: number;
  label: string;
}

export interface MapSubmissionFormModel {
  format_id: number | null;
  proposed: number | null;
  proof_image: File | null;
  subm_notes: string;
  video_proof_urls: string[];
}

const props = withDefaults(
  defineProps<{
    modelValue: MapSubmissionFormModel;
    disabled?: boolean;
    externalErrors?: FormFieldError[];
    eligibleFormats: Format[];
    disabledFormatIds?: number[];
    proposedDifficulties: string[];
    videoRequired?: boolean;
  }>(),
  {
    disabled: false,
    externalErrors: () => [],
    disabledFormatIds: () => [],
    proposedDifficulties: () => [],
    videoRequired: false,
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: MapSubmissionFormModel): void;
  (e: "errors", value: FormFieldError[]): void;
}>();

const { touchAll, clearTouched, isTouched, touch } = useTouchedProvider();
defineExpose({ touchAll, clearTouched });

const imageError = ref<string | null>(null);

function update(partial: Partial<MapSubmissionFormModel>) {
  for (const key of Object.keys(partial)) touch(key);
  emit("update:modelValue", { ...props.modelValue, ...partial });
}

function formatIcon(formatId: number): string | undefined {
  return FORMAT_ICONS.find((f) => f.id === formatId)?.image;
}

const selectedFormat = computed(
  () =>
    props.eligibleFormats.find((f) => f.id === props.modelValue.format_id) ??
    null,
);

const isNostalgiaPack = computed(
  () => props.modelValue.format_id === FORMAT_NOSTALGIA_PACK,
);

// --- Proposed category ---

const proposedOptions = computed<ProposedOption[]>(() =>
  props.proposedDifficulties.map((label, index) => ({ index, label })),
);

const selectedProposed = ref<ProposedOption | null>(null);

watch(
  () => props.modelValue.proposed,
  (val) => {
    if (val == null) selectedProposed.value = null;
  },
);

const { contains } = useFilter({ sensitivity: "base" });

function searchProposed(query: string): Promise<ProposedOption[]> {
  if (isNostalgiaPack.value) {
    return searchRetroMaps(query);
  }
  const filtered = proposedOptions.value.filter((o) =>
    contains(o.label, query),
  );
  return Promise.resolve(filtered);
}

async function searchRetroMaps(query: string): Promise<ProposedOption[]> {
  const response = await getRetroMaps({ search: query, per_page: 5 });
  return response.data.map((m) => ({
    index: m.id,
    label: `${m.name} (${m.game.game_name} — ${m.game.category_name})`,
  }));
}

function onProposedSelect(option: ProposedOption | null) {
  selectedProposed.value = option;
  update({ proposed: option?.index ?? null });
}

const showProposedCategory = computed(
  () => isNostalgiaPack.value || props.proposedDifficulties.length > 0,
);

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
    errors.push({
      path: "format_id",
      message: "Please select a list.",
      source: "validation",
    });
  }

  if (props.modelValue.proof_image == null) {
    errors.push({
      path: "proof_image",
      message: "A proof image is required.",
      source: "validation",
    });
  }

  if (props.modelValue.subm_notes.length > 5000) {
    errors.push({
      path: "subm_notes",
      message: "Notes must be 5000 characters or less.",
      source: "validation",
    });
  }

  const nonEmptyVideos = props.modelValue.video_proof_urls.filter(
    (v) => v.trim() !== "",
  );
  if (props.videoRequired && nonEmptyVideos.length === 0) {
    errors.push({
      path: "video_proof_urls",
      message: "At least one video URL is required.",
      source: "validation",
    });
  }
  for (const url of nonEmptyVideos) {
    if (!isValidUrl(url)) {
      errors.push({
        path: "video_proof_urls",
        message: `"${url}" is not a valid URL.`,
        source: "validation",
      });
      break;
    }
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

function indexedFieldErrors(field: string, length: number): (string | undefined)[] {
  return Array.from({ length }, (_, i) =>
    activeErrors.value.find((e) => e.path === `${field}.${i}`)?.message,
  );
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
      <p v-if="fieldError('proof_image')" class="text-(--color-danger) text-sm mt-1">
        {{ fieldError("proof_image") }}
      </p>
      <p v-else-if="imageError" class="text-(--color-danger) text-sm mt-1">
        {{ imageError }}
      </p>
    </div>

    <!-- Video URLs -->
    <UrlListInput
      :model-value="modelValue.video_proof_urls"
      :disabled="disabled"
      :required="videoRequired"
      label="Video Proof"
      :max="5"
      :item-errors="indexedFieldErrors('video_proof_urls', modelValue.video_proof_urls.length)"
      @update:model-value="update({ video_proof_urls: $event })"
    />
    <p v-if="fieldError('video_proof_urls')" class="text-(--color-danger) text-sm -mt-4">
      {{ fieldError("video_proof_urls") }}
    </p>

    <!-- List Picker -->
    <div>
      <label class="block font-bold mb-1">Submit to</label>
      <div class="flex flex-wrap gap-2">
        <Button
          v-for="fmt in eligibleFormats"
          :key="fmt.id"
          :active="modelValue.format_id === fmt.id"
          :disabled="disabled || disabledFormatIds.includes(fmt.id)"
          @click="
            !disabledFormatIds.includes(fmt.id) && update({ format_id: fmt.id })
          "
        >
          <span class="flex items-center gap-2">
            <img
              v-if="formatIcon(fmt.id)"
              :src="formatIcon(fmt.id)"
              :alt="fmt.name"
              class="w-5 h-5"
            />
            {{ fmt.name }}
            <span
              v-if="disabledFormatIds.includes(fmt.id)"
              class="text-xs opacity-60"
              >(already in list)</span
            >
          </span>
        </Button>
      </div>
      <p v-if="fieldError('format_id')" class="text-(--color-danger) text-sm mt-1">
        {{ fieldError("format_id") }}
      </p>
      <p v-if="selectedFormat" class="text-(--color-text-muted) text-sm mt-2">
        Make sure to check{{
          selectedFormat.name.toLowerCase().startsWith("the") ? "" : " the"
        }}
        <RouterLink
          :to="`/maps/${selectedFormat.slug}/map-rules`"
          class="text-(--color-highlight) hover:text-(--color-active)"
          >{{ selectedFormat.name }} map submission rules</RouterLink
        >
        before submitting.
      </p>
    </div>

    <!-- Proposed Category -->
    <div v-if="showProposedCategory">
      <label class="block font-bold mb-1">Proposed Category</label>
      <AsyncSelect
        :key="modelValue.format_id ?? 'none'"
        :model-value="selectedProposed"
        :search-fn="searchProposed"
        :display-value="(o: ProposedOption) => o.label"
        :disabled="disabled"
        :min-chars="0"
        :debounce="isNostalgiaPack ? 400 : 0"
        placeholder="Search categories..."
        @update:model-value="onProposedSelect"
      />
      <p v-if="fieldError('proposed')" class="text-(--color-danger) text-sm mt-1">
        {{ fieldError("proposed") }}
      </p>
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
        @input="
          update({ subm_notes: ($event.target as HTMLTextAreaElement).value })
        "
      />
      <div class="flex justify-between mt-1">
        <p v-if="fieldError('subm_notes')" class="text-(--color-danger) text-sm">
          {{ fieldError("subm_notes") }}
        </p>
        <span class="text-(--color-text-muted) text-xs ml-auto">
          {{ modelValue.subm_notes.length }} / 5000
        </span>
      </div>
    </div>
  </div>
</template>
