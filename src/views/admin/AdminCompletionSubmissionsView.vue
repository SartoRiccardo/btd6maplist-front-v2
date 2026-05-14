<script setup lang="ts">
import { computed, ref } from "vue";
import { useIsFetching } from "@tanstack/vue-query";
import { useAuthStore } from "@/stores/auth";
import { useFormats } from "@/services/api/formats/queries";
import {
  useDeleteCompletion,
  useSetAdminNote,
  useUpdateCompletion,
  completionQueryKeys,
} from "@/services/api/completions/queries";
import { ApiError } from "@/services/api/client";
import { parseApiErrors } from "@/services/api/formErrors";
import { permissions } from "@/constants/permissions";
import { provideCompletionActions } from "@/composables/useCompletionActions";
import { toast } from "vue-sonner";
import CompletionList from "@/components/completions/CompletionList.vue";
import ConfirmModal from "@/components/common/ConfirmModal.vue";
import PromptModal from "@/components/common/PromptModal.vue";
import type { CompletionDetail } from "@/services/api/completions/types";

const auth = useAuthStore();
const { data: formatsResponse } = useFormats();

const rejectModal = ref<InstanceType<typeof ConfirmModal>>();
const approveModal = ref<InstanceType<typeof ConfirmModal>>();
const addNoteModal = ref<InstanceType<typeof PromptModal>>();

const { mutateAsync: rejectCompletion, isPending: isRejecting } =
  useDeleteCompletion();
const { mutateAsync: updateCompletion, isPending: isApproving } =
  useUpdateCompletion();
const { mutateAsync: setAdminNote } = useSetAdminNote();
const isFetching = useIsFetching({ queryKey: completionQueryKeys.all });
const isDisabled = computed(
  () => isRejecting.value || isApproving.value || isFetching.value > 0,
);

provideCompletionActions({
  disabled: isDisabled,
  shouldShowActions: (completion) =>
    completion.accepted_by == null &&
    completion.deleted_on == null &&
    !completion.admin_note,
  onApprove: async (completion: CompletionDetail) => {
    const confirmed = await approveModal.value!.confirm();
    if (!confirmed) return;
    try {
      await updateCompletion({
        id: completion.id,
        data: {
          format_id: completion.format_id,
          players: completion.players.map((p) => p.discord_id),
          black_border: completion.black_border,
          no_geraldo: completion.no_geraldo,
          lcc: completion.lcc,
          accept: true,
          additional_image_proofs: [],
        },
      });
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        const result = parseApiErrors(error);
        toast.error(result.message ?? "Something went wrong. Please try again.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  },
  onReject: async (completion: CompletionDetail) => {
    const confirmed = await rejectModal.value!.confirm();
    if (!confirmed) return;
    await rejectCompletion(completion.id);
  },
  onAddNote: async (completion: CompletionDetail) => {
    const note = await addNoteModal.value!.prompt();
    if (!note) return;
    try {
      await setAdminNote({ id: completion.id, note });
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  },
});

const allowedFormatIds = computed(() => {
  const formats = formatsResponse.value?.data ?? [];
  return formats
    .filter(
      (f) =>
        auth.hasPermission(permissions.completion.edit, f.id) ||
        auth.hasPermission(permissions.completion.delete, f.id),
    )
    .map((f) => f.id);
});
</script>

<template>
  <div>
    <h1
      class="font-['Luckiest_Guy'] text-3xl md:text-4xl text-center mt-6 mb-4"
    >
      Completion Submissions
    </h1>

    <CompletionList
      v-if="allowedFormatIds.length > 0"
      :params="{
        format_id: allowedFormatIds,
        pending: 'only',
        deleted: 'any',
      }"
      :show-filters="false"
      map-display="detail"
      :include-admin-note="true"
      empty-message="No pending completions."
    />
    <p
      v-else-if="formatsResponse"
      class="text-center text-(--color-text-muted)"
    >
      You don't have permission to review completions for any format.
    </p>

    <ConfirmModal ref="approveModal" confirm-label="Accept">
      Do you want to accept this completion?
    </ConfirmModal>
    <ConfirmModal ref="rejectModal" confirm-label="Reject" danger>
      Do you want to reject this completion?
    </ConfirmModal>
    <PromptModal
      ref="addNoteModal"
      title="Add Admin Note"
      confirm-label="Save Note"
      placeholder="Write a note visible to admins only..."
    />
  </div>
</template>
