<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import {
  useCompletion,
  useUpdateCompletion,
  useDeleteCompletion,
} from "@/services/api/completions/queries";
import { useFormats } from "@/services/api/formats/queries";
import type {
  CompletionDetail,
  UpdateCompletionRequest,
} from "@/services/api/completions/types";
import { ApiError } from "@/services/api/client";
import { parseApiErrors, type FormFieldError } from "@/services/api/formErrors";
import { toast } from "vue-sonner";
import { permissions } from "@/constants/permissions";
import Panel from "@/components/ui/Panel.vue";
import Button from "@/components/ui/Button.vue";
import LinkButton from "@/components/ui/LinkButton.vue";
import CompletionProofs from "@/components/completions/CompletionProofs.vue";
import CompletionForm, {
  type CompletionFormModel,
} from "@/components/completions/CompletionForm.vue";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const id = computed(() => Number(route.params["id"]));

const { data: completionData, isLoading: completionLoading } =
  useCompletion(id);
const { data: formatsResponse, isLoading: formatsLoading } = useFormats();

const isLoading = computed(
  () => completionLoading.value || formatsLoading.value || auth.isLoading,
);
const canEdit = computed(
  () =>
    completionData.value != null &&
    auth.hasPermission(
      permissions.completion.edit,
      completionData.value.format_id,
    ),
);
const formats = computed(() =>
  (formatsResponse.value?.data ?? []).filter((f) =>
    auth.hasPermission(permissions.completion.edit, f.id),
  ),
);

function toFormModel(c: CompletionDetail): CompletionFormModel {
  return {
    format_id: c.format_id,
    black_border: c.black_border,
    no_geraldo: c.no_geraldo,
    lcc_enabled: c.lcc !== null,
    lcc_leftover: c.lcc?.leftover ?? null,
    players: c.players.map((p) => p.discord_id),
  };
}

const formModel = ref<CompletionFormModel>({
  format_id: null,
  black_border: false,
  no_geraldo: false,
  lcc_enabled: false,
  lcc_leftover: null,
  players: [""],
});

watch(
  completionData,
  (data) => {
    if (data) formModel.value = toFormModel(data);
  },
  { immediate: true },
);

const isDeleted = computed(() => completionData.value?.deleted_on != null);

const updateMutation = useUpdateCompletion();
const deleteMutation = useDeleteCompletion();

async function handleDelete() {
  try {
    await deleteMutation.mutateAsync(id.value);
    toast.success("Completion deleted.");
    router.back();
  } catch {
    toast.error("Something went wrong. Please try again.");
  }
}
const formRef = ref<InstanceType<typeof CompletionForm> | null>(null);
const apiErrors = ref<FormFieldError[]>([]);
const activeErrors = ref<FormFieldError[]>([]);
const busy = computed(
  () => updateMutation.isPending.value || deleteMutation.isPending.value,
);

async function handleSave() {
  if (!formRef.value || !completionData.value) return;

  await formRef.value.touchAll();

  if (activeErrors.value.length > 0) {
    toast.error("Please fix the form errors.");
    return;
  }

  const model = formModel.value;
  const isAccepted = completionData.value.accepted_by !== null;

  const request: UpdateCompletionRequest = {
    format_id: model.format_id!,
    players: model.players.filter(Boolean),
    black_border: model.black_border,
    no_geraldo: model.no_geraldo,
    lcc:
      model.lcc_enabled && model.lcc_leftover != null
        ? { leftover: model.lcc_leftover }
        : null,
    accept: isAccepted,
  };

  try {
    await updateMutation.mutateAsync({ id: id.value, data: request });
    toast.success("Completion updated.");
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      apiErrors.value = parseApiErrors(error);
      if (apiErrors.value.length > 0) {
        await formRef.value.clearTouched();
      } else {
        const msg = (error.response as { message?: string } | null)?.message;
        toast.error(msg ?? "Something went wrong. Please try again.");
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
      Edit Completion
    </h1>

    <Panel v-if="isLoading">
      <p class="text-(--color-text-muted) text-center">Loading...</p>
    </Panel>

    <Panel v-else-if="!canEdit">
      <p class="text-(--color-text-muted) text-center">
        You don't have permission to edit completions.
      </p>
    </Panel>

    <Panel v-else-if="!completionData">
      <p class="text-(--color-text-muted) text-center">Completion not found.</p>
    </Panel>

    <Panel v-else>
      <CompletionProofs
        :subm-notes="completionData.subm_notes"
        :proof-images="completionData.subm_proof_img"
        :proof-videos="completionData.subm_proof_vid"
      />

      <hr
        v-if="
          completionData.subm_notes ||
          completionData.subm_proof_img.length > 0 ||
          completionData.subm_proof_vid.length > 0
        "
        class="border-(--color-contrast) mb-6"
      />

      <CompletionForm
        ref="formRef"
        v-model="formModel"
        :disabled="busy || isDeleted"
        :external-errors="apiErrors"
        :formats="formats"
        :initial-players="completionData.players"
        @errors="activeErrors = $event"
      />

      <p
        v-if="isDeleted"
        class="mt-6 px-4 py-3 rounded-(--radius-panel) border border-red-500/50 bg-red-500/10 text-red-400 text-sm"
      >
        This completion was deleted.
      </p>

      <div class="flex justify-between mt-6">
        <template v-if="!isDeleted">
          <Button :disabled="busy" @click="handleDelete">Delete</Button>
          <div class="flex gap-2">
            <LinkButton to="/admin/submissions/completions" :disabled="busy">
              Cancel
            </LinkButton>
            <Button :disabled="busy" @click="handleSave">Save</Button>
          </div>
        </template>
        <LinkButton v-else to="/admin/submissions/completions">
          Cancel
        </LinkButton>
      </div>
    </Panel>
  </div>
</template>
