<script setup lang="ts">
import { computed, ref } from "vue";
import { useIsFetching } from "@tanstack/vue-query";
import { useAuthStore } from "@/stores/auth";
import { useFormats } from "@/services/api/formats/queries";
import { useDeleteCompletion } from "@/services/api/completions/queries";
import { completionQueryKeys } from "@/services/api/completions/queries";
import { permissions } from "@/constants/permissions";
import { provideCompletionActions } from "@/composables/useCompletionActions";
import CompletionList from "@/components/completions/CompletionList.vue";
import ConfirmModal from "@/components/common/ConfirmModal.vue";
import type { CompletionDetail } from "@/services/api/completions/types";

const auth = useAuthStore();
const { data: formatsResponse } = useFormats();

const rejectModal = ref<InstanceType<typeof ConfirmModal>>();
const { mutateAsync: rejectCompletion, isPending: isRejecting } =
  useDeleteCompletion();
const isFetching = useIsFetching({ queryKey: completionQueryKeys.all });
const isDisabled = computed(() => isRejecting.value || isFetching.value > 0);

provideCompletionActions({
  disabled: isDisabled,
  shouldShowActions: (completion) =>
    completion.accepted_by == null && completion.deleted_on == null,
  onApprove: (completion: CompletionDetail) => {
    console.log("approve", completion);
  },
  onReject: async (completion: CompletionDetail) => {
    const confirmed = await rejectModal.value!.confirm();
    if (!confirmed) return;
    await rejectCompletion(completion.id);
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
      empty-message="No pending completions."
    />
    <p
      v-else-if="formatsResponse"
      class="text-center text-(--color-text-muted)"
    >
      You don't have permission to review completions for any format.
    </p>

    <ConfirmModal ref="rejectModal" confirm-label="Reject" danger>
      Do you want to reject this completion?
    </ConfirmModal>
  </div>
</template>
