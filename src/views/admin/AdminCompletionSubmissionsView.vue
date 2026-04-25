<script setup lang="ts">
import { computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useFormats } from "@/services/api/formats/queries";
import { permissions } from "@/constants/permissions";
import { provideCompletionActions } from "@/composables/useCompletionActions";
import CompletionList from "@/components/completions/CompletionList.vue";

const auth = useAuthStore();
const { data: formatsResponse } = useFormats();

provideCompletionActions({
  onApprove: (id) => {
    console.log("approve", id);
  },
  onReject: (id) => {
    console.log("reject", id);
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
    <p v-else-if="formatsResponse" class="text-center text-(--color-text-muted)">
      You don't have permission to review completions for any format.
    </p>
  </div>
</template>
