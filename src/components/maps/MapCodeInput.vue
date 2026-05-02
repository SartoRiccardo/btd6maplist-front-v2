<script setup lang="ts">
import { watch } from "vue";
import { useNKMapValidation } from "@/composables/useNKMapValidation";
import type { NKCustomMap } from "@/services/ninjakiwi";
import type { MapDetail } from "@/services/api/maps/types";

const codeInput = defineModel<string>({ default: "" });

defineProps<{
  disabled?: boolean;
  externalError?: string;
}>();

export interface MapCodeValidation {
  nkMap: NKCustomMap | null;
  nkError: string | null;
  nkLoading: boolean;
  maplistMap: MapDetail | null;
  maplistLoading: boolean;
  isCodeValid: boolean;
}

const emit = defineEmits<{
  validation: [payload: MapCodeValidation];
}>();

function extractMapCode(input: string): string {
  const trimmed = input.trim();
  const joinMatch = trimmed.match(/join\.btd6\.com\/Map\/([A-Za-z]{7})/i);
  if (joinMatch) return joinMatch[1]!.toUpperCase();
  const nkMatch = trimmed.match(
    /data\.ninjakiwi\.com\/btd6\/maps\/map\/([A-Za-z]{7})/i,
  );
  if (nkMatch) return nkMatch[1]!.toUpperCase();
  return trimmed;
}

watch(codeInput, (val) => {
  const extracted = extractMapCode(val);
  if (extracted !== val) {
    codeInput.value = extracted;
  }
});

const { nkMap, nkError, nkLoading, maplistMap, maplistLoading, isCodeValid } =
  useNKMapValidation(codeInput);

watch(
  [nkMap, nkError, nkLoading, maplistMap, maplistLoading, isCodeValid],
  () => {
    emit("validation", {
      nkMap: nkMap.value,
      nkError: nkError.value,
      nkLoading: nkLoading.value,
      maplistMap: maplistMap.value,
      maplistLoading: maplistLoading.value,
      isCodeValid: isCodeValid.value,
    });
  },
  { immediate: true },
);
</script>

<template>
  <div>
    <label for="map-code" class="block font-bold mb-2">Map Code</label>
    <input
      id="map-code"
      v-model="codeInput"
      type="text"
      placeholder="ZFMOOKU"
      :disabled="disabled"
      class="w-full px-3 py-2 rounded-(--radius-btn) bg-(--color-primary) text-(--color-text) border border-(--color-contrast) focus:outline-none focus:border-(--color-active) uppercase"
    />
    <p class="text-(--color-text-muted) text-xs mt-1">
      You can also paste the full map share URL.
    </p>
    <div class="mt-2 text-sm">
      <p v-if="nkLoading" class="text-(--color-text-muted)">
        <i class="bi bi-arrow-repeat animate-spin inline-block" />
        Validating...
      </p>
      <p v-else-if="nkError" class="text-(--color-danger)">
        {{ nkError }}
      </p>
      <p v-else-if="nkMap && maplistLoading" class="text-(--color-text-muted)">
        <i class="bi bi-arrow-repeat animate-spin inline-block" />
        Checking list status...
      </p>
      <p v-else-if="externalError" class="text-(--color-danger)">
        {{ externalError }}
      </p>
    </div>
  </div>
</template>
