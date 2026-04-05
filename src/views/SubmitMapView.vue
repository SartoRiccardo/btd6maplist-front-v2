<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useFormats } from "@/services/api/formats/queries";
import { useCreateMapSubmission } from "@/services/api/map-submissions/queries";
import { useNKMapValidation } from "@/composables/useNKMapValidation";
import { getFormatsMapIsIn } from "@/utils/formatBadges";
import { permissions } from "@/constants/permissions";
import { ApiError } from "@/services/api/client";
import { parseApiErrors, type FormFieldError } from "@/services/api/formErrors";
import Panel from "@/components/ui/Panel.vue";
import Button from "@/components/ui/Button.vue";
import DiscordLoginButton from "@/components/navbar/DiscordLoginButton.vue";
import SubmitMapForm, {
  type MapSubmissionFormModel,
} from "@/components/maps/SubmitMapForm.vue";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

// --- Query params ---

const preselectedFormatId = computed(() => {
  const on = route.query["on"];
  return on ? Number(on) : null;
});

const remakeOf = computed(() => {
  const id = route.query["remake_of"];
  return id ? Number(id) : null;
});

// --- Map code validation ---

const codeInput = ref("");

const { nkMap, nkError, nkLoading, maplistMap, maplistLoading, isCodeValid } =
  useNKMapValidation(codeInput);

// --- Formats ---

const { data: formatsResponse, isLoading: formatsLoading } = useFormats();

const visibleFormats = computed(() => {
  if (!formatsResponse.value) return [];
  return formatsResponse.value.data.filter(
    (f) => f.map_submission_status !== "closed",
  );
});

const disabledFormatIds = computed(() => {
  if (!maplistMap.value) return [];
  return getFormatsMapIsIn(maplistMap.value);
});

const eligibleFormats = computed(() =>
  visibleFormats.value.filter((f) => !disabledFormatIds.value.includes(f.id)),
);

const canSubmit = computed(() =>
  auth.hasPermission(permissions.mapSubmission.create),
);

const isDataReady = computed(
  () => isCodeValid.value && !formatsLoading.value && !maplistLoading.value,
);

// --- Form state ---

const formModel = ref<MapSubmissionFormModel>({
  format_id: null,
  proposed: null,
  proof_image: null,
  subm_notes: "",
});

// Auto-select format from ?on= param or when only one eligible
watch(
  eligibleFormats,
  (fmts) => {
    if (fmts.length === 1 && formModel.value.format_id !== fmts[0]!.id) {
      formModel.value = { ...formModel.value, format_id: fmts[0]!.id };
    } else if (
      preselectedFormatId.value &&
      fmts.some((f) => f.id === preselectedFormatId.value) &&
      formModel.value.format_id == null
    ) {
      formModel.value = {
        ...formModel.value,
        format_id: preselectedFormatId.value,
      };
    }
  },
  { immediate: true },
);

// Reset proposed when format changes
watch(
  () => formModel.value.format_id,
  () => {
    formModel.value = { ...formModel.value, proposed: null };
  },
);

const selectedFormat = computed(
  () =>
    eligibleFormats.value.find((f) => f.id === formModel.value.format_id) ??
    null,
);

const proposedDifficulties = computed(
  () => selectedFormat.value?.proposed_difficulties ?? [],
);

// --- Submission ---

const submitMutation = useCreateMapSubmission();
const formRef = ref<InstanceType<typeof SubmitMapForm> | null>(null);
const apiErrors = ref<FormFieldError[]>([]);
const activeErrors = ref<FormFieldError[]>([]);
const submitError = ref<string | null>(null);
const busy = computed(
  () =>
    submitMutation.isPending.value ||
    nkLoading.value ||
    maplistLoading.value ||
    auth.isLoading,
);

async function handleSubmit() {
  if (!formRef.value) return;

  submitError.value = null;
  await formRef.value.touchAll();

  if (activeErrors.value.length > 0) return;

  const model = formModel.value;

  try {
    await submitMutation.mutateAsync({
      code: codeInput.value.trim().toUpperCase(),
      format_id: model.format_id!,
      proposed: model.proposed ?? 0,
      completion_proof: model.proof_image!,
      subm_notes: model.subm_notes || undefined,
    });
    router.push("/my-submissions/maps");
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      apiErrors.value = parseApiErrors(error);
      await formRef.value.clearTouched();
      if (apiErrors.value.length === 0) {
        submitError.value = "Something went wrong. Please try again.";
      }
    } else {
      submitError.value = "Something went wrong. Please try again.";
    }
  }
}
</script>

<template>
  <div>
    <h1 class="font-['Luckiest_Guy'] text-3xl text-center mb-6">Submit Map</h1>

    <!-- Not authenticated -->
    <Panel
      v-if="!auth.isAuthenticated && !auth.isLoading"
      class="flex flex-col items-center gap-4"
    >
      <p class="text-(--color-text-muted)">
        You must be logged in to submit a map.
      </p>
      <DiscordLoginButton />
    </Panel>

    <!-- No permission -->
    <Panel v-else-if="!auth.isLoading && !canSubmit">
      <p class="text-(--color-text-muted) text-center">
        You don't have permission to submit maps.
      </p>
    </Panel>

    <template v-else-if="!auth.isLoading">
      <!-- Map Code Input -->
      <Panel class="mb-6">
        <label for="map-code" class="block font-bold mb-2">Map Code</label>
        <input
          id="map-code"
          v-model="codeInput"
          type="text"
          placeholder="ZFMOOKU"
          maxlength="7"
          :disabled="busy"
          class="w-full px-3 py-2 rounded-(--radius-btn) bg-(--color-primary) text-(--color-text) border border-(--color-contrast) focus:outline-none focus:border-(--color-active) uppercase"
        />
        <div class="mt-2 text-sm">
          <p v-if="nkLoading" class="text-(--color-text-muted)">
            <i class="bi bi-arrow-repeat animate-spin inline-block" />
            Validating...
          </p>
          <p v-else-if="nkError" class="text-red-400">
            {{ nkError }}
          </p>
          <template v-else-if="nkMap">
            <p class="text-green-400">
              <i class="bi bi-check-circle-fill mr-1" />{{ nkMap.name }}
            </p>
            <p v-if="maplistLoading" class="text-(--color-text-muted) mt-1">
              <i class="bi bi-arrow-repeat animate-spin inline-block" />
              Checking list status...
            </p>
          </template>
        </div>
      </Panel>

      <!-- Form (only when code is valid and data is ready) -->
      <template v-if="isDataReady">
        <!-- No visible formats -->
        <Panel v-if="visibleFormats.length === 0">
          <p class="text-(--color-text-muted) text-center">
            No lists are currently accepting map submissions.
          </p>
        </Panel>

        <!-- All visible formats are disabled (map already in all) -->
        <Panel v-else-if="eligibleFormats.length === 0">
          <p class="text-(--color-text-muted) text-center">
            This map is already in all available lists.
          </p>
        </Panel>

        <!-- The form -->
        <Panel v-else>
          <SubmitMapForm
            ref="formRef"
            v-model="formModel"
            :disabled="busy"
            :external-errors="apiErrors"
            :eligible-formats="visibleFormats"
            :disabled-format-ids="disabledFormatIds"
            :proposed-difficulties="proposedDifficulties"
            @errors="activeErrors = $event"
          />

          <p v-if="submitError" class="text-red-400 text-sm mt-3">
            {{ submitError }}
          </p>

          <div class="flex justify-end gap-2 mt-6">
            <Button :disabled="busy" @click="handleSubmit"> Submit </Button>
          </div>
        </Panel>
      </template>
    </template>
  </div>
</template>
