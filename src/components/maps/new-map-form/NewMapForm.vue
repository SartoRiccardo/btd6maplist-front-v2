<script setup lang="ts">
import { ref, computed } from "vue";
import { useTouchedProvider } from "@/composables/useTouchedFields";
import { useEmitOnChange } from "@/composables/useEmitOnChange";
import type { FormFieldError } from "@/services/api/formErrors";
import type {
  NewMapFormModel,
  MapInfoSlice,
  ListPlacementSlice,
  CreditsSlice,
} from "./types";
import MapInfoSection from "./MapInfoSection.vue";
import ListPlacementSection from "./ListPlacementSection.vue";
import CreditsSection from "./CreditsSection.vue";

const props = withDefaults(
  defineProps<{
    modelValue: NewMapFormModel;
    disabled?: boolean;
    externalErrors?: FormFieldError[];
    editableFormats: number[];
  }>(),
  { disabled: false, externalErrors: () => [] },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: NewMapFormModel): void;
  (e: "errors", value: FormFieldError[]): void;
}>();

const { touchAll, clearTouched } = useTouchedProvider();
defineExpose({ touchAll, clearTouched });

// --- Model slicing ---

const infoSlice = computed<MapInfoSlice>({
  get: () => ({
    name: props.modelValue.name,
    map_preview_url: props.modelValue.map_preview_url,
    custom_map_preview_file: props.modelValue.custom_map_preview_file,
    r6_start: props.modelValue.r6_start,
    r6_start_file: props.modelValue.r6_start_file,
    aliases: props.modelValue.aliases,
    additional_codes: props.modelValue.additional_codes,
  }),
  set: (slice) => {
    emit("update:modelValue", { ...props.modelValue, ...slice });
  },
});

const placementSlice = computed<ListPlacementSlice>({
  get: () => ({
    placement_curver: props.modelValue.placement_curver,
    placement_allver: props.modelValue.placement_allver,
    difficulty: props.modelValue.difficulty,
    botb_difficulty: props.modelValue.botb_difficulty,
    remake_of: props.modelValue.remake_of,
    optimal_heros: props.modelValue.optimal_heros,
  }),
  set: (slice) => {
    emit("update:modelValue", { ...props.modelValue, ...slice });
  },
});

const creditsSlice = computed<CreditsSlice>({
  get: () => ({
    creators: props.modelValue.creators,
    verifiers: props.modelValue.verifiers,
  }),
  set: (slice) => {
    emit("update:modelValue", { ...props.modelValue, ...slice });
  },
});

// --- Error routing ---

const SECTION_FIELD_OWNERS: Record<string, string> = {
  name: "info",
  map_preview_url: "info",
  custom_map_preview_file: "info",
  r6_start: "info",
  r6_start_file: "info",
  aliases: "info",
  additional_codes: "info",
  placement_curver: "placement",
  placement_allver: "placement",
  difficulty: "placement",
  botb_difficulty: "placement",
  remake_of: "placement",
  optimal_heros: "placement",
  creators: "credits",
  verifiers: "credits",
};

function errorsForSection(sectionId: string): FormFieldError[] {
  return (props.externalErrors ?? []).filter(
    (e) => SECTION_FIELD_OWNERS[e.path.split(".")[0] ?? ""] === sectionId,
  );
}

// --- Error aggregation ---

const childErrorMap = ref<Map<string, FormFieldError[]>>(new Map());

function handleSectionErrors(sectionId: string, errors: FormFieldError[]) {
  const map = new Map(childErrorMap.value);
  if (errors.length === 0) map.delete(sectionId);
  else map.set(sectionId, errors);
  childErrorMap.value = map;
}

const flatErrors = computed<FormFieldError[]>(() => {
  const result: FormFieldError[] = [];
  for (const [, errors] of childErrorMap.value) result.push(...errors);
  return result;
});

useEmitOnChange(flatErrors, (errors) => emit("errors", errors));
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- Section 1: Map Information -->
    <h2 class="font-['Luckiest_Guy'] text-2xl text-center">Map Information</h2>
    <hr class="border-(--color-contrast)" />
    <MapInfoSection
      v-model="infoSlice"
      :disabled="disabled"
      :external-errors="errorsForSection('info')"
      @errors="handleSectionErrors('info', $event)"
    />

    <!-- Section 2: List Placement -->
    <h2 class="font-['Luckiest_Guy'] text-2xl text-center pt-12">
      List Placements
    </h2>
    <hr class="border-(--color-contrast) pb-4" />
    <ListPlacementSection
      v-model="placementSlice"
      :disabled="disabled"
      :external-errors="errorsForSection('placement')"
      :editable-formats="editableFormats"
      @errors="handleSectionErrors('placement', $event)"
    />

    <!-- Section 3: Credits -->
    <h2 class="font-['Luckiest_Guy'] text-2xl text-center pt-12">Credits</h2>
    <hr class="border-(--color-contrast)" />
    <CreditsSection
      v-model="creditsSlice"
      :disabled="disabled"
      :external-errors="errorsForSection('credits')"
      @errors="handleSectionErrors('credits', $event)"
    />
  </div>
</template>
