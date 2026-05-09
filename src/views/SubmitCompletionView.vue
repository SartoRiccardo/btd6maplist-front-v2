<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useMap } from "@/services/api/maps/queries";
import { useFormats } from "@/services/api/formats/queries";
import { useSubmitCompletion } from "@/services/api/completions/queries";
import type { SubmitCompletionRequest } from "@/services/api/completions/types";
import { ApiError } from "@/services/api/client";
import { parseApiErrors, type FormFieldError } from "@/services/api/formErrors";
import { toast } from "vue-sonner";
import { getFormatsMapIsIn } from "@/utils/formatBadges";
import { permissions } from "@/constants/permissions";
import { FORMAT_EXPERT_LIST, GLOBAL_FORMAT } from "@/constants/formats";
import Panel from "@/components/ui/Panel.vue";
import Button from "@/components/ui/Button.vue";
import LinkButton from "@/components/ui/LinkButton.vue";
import DiscordLoginButton from "@/components/navbar/DiscordLoginButton.vue";
import SubmitCompletionForm, {
  type CompletionFormModel,
} from "@/components/completions/SubmitCompletionForm.vue";
import SubmitCompletionFormSkeleton from "@/components/completions/SubmitCompletionFormSkeleton.vue";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const code = computed(() => route.params["code"] as string);
const mapUrl = computed(() => `/map/${code.value}`);

const { data: mapData, isLoading: mapLoading } = useMap(code);
const { data: formatsResponse, isLoading: formatsLoading } = useFormats();

const isLoading = computed(
  () => mapLoading.value || formatsLoading.value || auth.isLoading,
);

// --- Format resolution ---

const eligibleFormats = computed(() => {
  if (!mapData.value || !formatsResponse.value) return [];
  const mapFormatIds = getFormatsMapIsIn(mapData.value);
  return formatsResponse.value.data.filter(
    (f) => mapFormatIds.includes(f.id) && f.run_submission_status !== "closed",
  );
});

const canSubmit = computed(() =>
  auth.hasPermission(permissions.completionSubmission.create, GLOBAL_FORMAT),
);

const videoRequired = computed(() => {
  const model = formModel.value;

  if (auth.hasPermission(permissions.completionSubmission.requireRecording, GLOBAL_FORMAT))
    return true;
  if (model.black_border) return true;
  if (model.lcc_enabled) return true;
  if (model.no_geraldo) {
    if (model.format_id !== FORMAT_EXPERT_LIST) return true;
    // Expert List: only required for difficulty > 2
    const difficulty = mapData.value?.difficulty ?? null;
    if (difficulty != null && difficulty > 2) return true;
  }

  return false;
});

// --- Form state ---

const formModel = ref<CompletionFormModel>({
  format_id: null,
  proof_images: [],
  black_border: false,
  no_geraldo: false,
  subm_notes: "",
  proof_videos: [""],
  lcc_enabled: false,
  lcc_leftover: null,
});

// Auto-select when only one eligible format
watch(
  eligibleFormats,
  (fmts) => {
    if (fmts.length === 1 && formModel.value.format_id !== fmts[0]!.id) {
      formModel.value = { ...formModel.value, format_id: fmts[0]!.id };
    }
  },
  { immediate: true },
);

const selectedFormat = computed(
  () =>
    eligibleFormats.value.find((f) => f.id === formModel.value.format_id) ??
    null,
);

const isLccOnly = computed(
  () => selectedFormat.value?.run_submission_status === "lcc_only",
);

const noGeraldoEnabled = computed(
  () => selectedFormat.value?.is_no_geraldo_enabled ?? false,
);

// Force LCC enabled when format is lcc_only
watch(isLccOnly, (lccOnly) => {
  if (lccOnly && !formModel.value.lcc_enabled) {
    formModel.value = { ...formModel.value, lcc_enabled: true };
  }
});

// --- Mutation ---

const submitMutation = useSubmitCompletion();
const formRef = ref<InstanceType<typeof SubmitCompletionForm> | null>(null);
const apiErrors = ref<FormFieldError[]>([]);
const activeErrors = ref<FormFieldError[]>([]);
const busy = computed(() => submitMutation.isPending.value);

async function handleSubmit() {
  if (!formRef.value || !mapData.value || !auth.user) return;

  await formRef.value.touchAll();

  if (activeErrors.value.length > 0) return;

  const model = formModel.value;
  const request: SubmitCompletionRequest = {
    map: code.value,
    format_id: model.format_id!,
    players: [auth.user.discord_id],
    proof_images: model.proof_images,
    black_border: model.black_border,
    no_geraldo: model.no_geraldo,
    subm_notes: model.subm_notes || undefined,
    proof_videos: model.proof_videos.filter((v) => v.trim() !== ""),
    lcc:
      model.lcc_enabled && model.lcc_leftover != null
        ? { leftover: model.lcc_leftover }
        : undefined,
  };

  try {
    await submitMutation.mutateAsync(request);
    router.push(mapUrl.value);
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      const errorResult = parseApiErrors(error);
      apiErrors.value = errorResult.fieldErrors;
      await formRef.value.clearTouched();
      if (errorResult.fieldErrors.length === 0) {
        const message = errorResult.message || "Something went wrong. Please try again.";
        toast.error(`${message} (Error code: ${errorResult.status})`);
      }
    } else {
      toast.error("Something went wrong. Please try again.");
    }
  }
}
</script>

<template>
  <div>
    <h1 class="font-['Luckiest_Guy'] text-3xl text-center mb-6">
      Submit Completion
      <template v-if="mapData"> for {{ mapData.name }}</template>
    </h1>

    <!-- Loading -->
    <Panel v-if="isLoading">
      <SubmitCompletionFormSkeleton />
    </Panel>

    <!-- Not authenticated -->
    <Panel
      v-else-if="!auth.isAuthenticated"
      class="flex flex-col items-center gap-4"
    >
      <p class="text-(--color-text-muted)">
        You must be logged in to submit a completion.
      </p>
      <DiscordLoginButton />
    </Panel>

    <!-- No permission -->
    <Panel v-else-if="!canSubmit">
      <p class="text-(--color-text-muted) text-center">
        You don't have permission to submit completions.
      </p>
    </Panel>

    <!-- No eligible formats -->
    <Panel v-else-if="eligibleFormats.length === 0">
      <p class="text-(--color-text-muted) text-center">
        This map is not currently accepting completion submissions.
      </p>
    </Panel>

    <!-- The form -->
    <Panel v-else>
      <SubmitCompletionForm
        ref="formRef"
        v-model="formModel"
        :disabled="busy"
        :external-errors="apiErrors"
        :eligible-formats="eligibleFormats"
        :video-required="videoRequired"
        :lcc-only="isLccOnly"
        :no-geraldo-enabled="noGeraldoEnabled"
        @errors="activeErrors = $event"
      />

      <div class="flex justify-end gap-2 mt-6">
        <LinkButton :to="mapUrl" :disabled="busy">Cancel</LinkButton>
        <Button :disabled="busy" @click="handleSubmit"> Submit </Button>
      </div>
    </Panel>
  </div>
</template>
