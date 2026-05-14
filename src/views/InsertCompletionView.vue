<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useMap } from "@/services/api/maps/queries";
import { useFormats } from "@/services/api/formats/queries";
import { useSaveCompletion } from "@/services/api/completions/queries";
import type { SaveCompletionRequest } from "@/services/api/completions/types";
import { ApiError } from "@/services/api/client";
import { parseApiErrors, type FormFieldError } from "@/services/api/formErrors";
import { toast } from "vue-sonner";
import { getFormatsMapIsIn } from "@/utils/formatBadges";
import { permissions } from "@/constants/permissions";
import Panel from "@/components/ui/Panel.vue";
import Button from "@/components/ui/Button.vue";
import LinkButton from "@/components/ui/LinkButton.vue";
import CompletionForm, {
  type CompletionFormModel,
} from "@/components/completions/CompletionForm.vue";
import ProofImageUploader from "@/components/completions/ProofImageUploader.vue";
import UrlListInput from "@/components/completions/UrlListInput.vue";

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

const eligibleFormats = computed(() => {
  if (!mapData.value || !formatsResponse.value) return [];
  const mapFormatIds = getFormatsMapIsIn(mapData.value);
  return formatsResponse.value.data.filter(
    (f) =>
      mapFormatIds.includes(f.id) &&
      auth.hasPermission(permissions.completion.create, f.id),
  );
});

const canInsert = computed(() =>
  auth.hasPermissionInAnyFormat(permissions.completion.create),
);

// --- Form state ---

const formModel = ref<CompletionFormModel>({
  format_id: null,
  black_border: false,
  no_geraldo: false,
  lcc_enabled: false,
  lcc_leftover: null,
  players: [""],
  additional_image_proofs: [],
  existing_image_proofs: [],
});

const proofImages = ref<File[]>([]);
const proofVideos = ref<string[]>([""]);
const imageError = ref<string | null>(null);

watch(
  eligibleFormats,
  (fmts) => {
    if (fmts.length === 1 && formModel.value.format_id !== fmts[0]!.id) {
      formModel.value = { ...formModel.value, format_id: fmts[0]!.id };
    }
  },
  { immediate: true },
);

// --- Mutation ---

const saveMutation = useSaveCompletion();
const formRef = ref<InstanceType<typeof CompletionForm> | null>(null);
const apiErrors = ref<FormFieldError[]>([]);
const activeErrors = ref<FormFieldError[]>([]);
const busy = computed(() => saveMutation.isPending.value);

async function handleSubmit() {
  if (!formRef.value || !mapData.value) return;

  await formRef.value.touchAll();

  if (proofImages.value.length === 0) {
    toast.error("At least one proof image is required.");
    return;
  }

  if (activeErrors.value.length > 0) return;

  const model = formModel.value;
  const request: SaveCompletionRequest = {
    map: code.value,
    format_id: model.format_id!,
    players: model.players.filter((p) => p.trim() !== ""),
    proof_images: proofImages.value,
    black_border: model.black_border,
    no_geraldo: model.no_geraldo,
    subm_notes: null,
    proof_videos: proofVideos.value.filter((v) => v.trim() !== ""),
    lcc:
      model.lcc_enabled && model.lcc_leftover != null
        ? { leftover: model.lcc_leftover }
        : null,
  };

  try {
    await saveMutation.mutateAsync(request);
    router.push(mapUrl.value);
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      apiErrors.value = parseApiErrors(error).fieldErrors;
      await formRef.value.clearTouched();
      if (apiErrors.value.length === 0) {
        toast.error("Something went wrong. Please try again.");
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
      Insert Completion
      <template v-if="mapData"> for {{ mapData.name }}</template>
    </h1>

    <!-- Loading -->
    <Panel v-if="isLoading" class="animate-pulse h-64" />

    <!-- No permission -->
    <Panel v-else-if="!canInsert">
      <p class="text-(--color-text-muted) text-center">
        You don't have permission to insert completions.
      </p>
    </Panel>

    <!-- No eligible formats -->
    <Panel v-else-if="eligibleFormats.length === 0">
      <p class="text-(--color-text-muted) text-center">
        There are no formats you can insert completions for on this map.
      </p>
    </Panel>

    <!-- The form -->
    <Panel v-else class="flex flex-col gap-6">
      <!-- Proof Images -->
      <div>
        <label class="block font-bold mb-2">Proof Images</label>
        <ProofImageUploader
          :model-value="proofImages"
          :disabled="busy"
          @update:model-value="proofImages = $event"
          @error="imageError = $event"
        />
        <p v-if="imageError" class="text-(--color-danger) text-sm mt-1">
          {{ imageError }}
        </p>
      </div>

      <!-- Proof Videos -->
      <UrlListInput
        :model-value="proofVideos"
        :disabled="busy"
        label="Proof Videos"
        :max="10"
        @update:model-value="proofVideos = $event"
      />

      <CompletionForm
        ref="formRef"
        v-model="formModel"
        :disabled="busy"
        :external-errors="apiErrors"
        :formats="eligibleFormats"
        @errors="activeErrors = $event"
      />

      <div class="flex justify-end gap-2 mt-2">
        <LinkButton :to="mapUrl" :disabled="busy">Cancel</LinkButton>
        <Button :disabled="busy" @click="handleSubmit">Insert</Button>
      </div>
    </Panel>
  </div>
</template>
