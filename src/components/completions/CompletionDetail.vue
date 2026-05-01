<script setup lang="ts">
import { computed, toValue } from "vue";
import type { CompletionDetail } from "@/services/api/completions/types";
import type { User } from "@/services/api/users/types";
import { useAuthStore } from "@/stores/auth";
import { permissions } from "@/constants/permissions";
import { useCompletionActions } from "@/composables/useCompletionActions";
import UserEntry from "@/components/users/UserEntry.vue";
import LinkButton from "@/components/ui/LinkButton.vue";
import Button from "@/components/ui/Button.vue";
import CompletionProofs from "@/components/completions/CompletionProofs.vue";

const props = defineProps<{
  completion: CompletionDetail;
}>();

const auth = useAuthStore();
const actions = useCompletionActions();

const acceptedByUser = computed<User | null>(() => {
  const ab = props.completion.accepted_by;
  if (ab != null && typeof ab === "object") return ab;
  return null;
});

const isPending = computed(() => props.completion.accepted_by == null);

const isOwnCompletion = computed(() =>
  props.completion.players.some((p) => p.discord_id === auth.user?.discord_id),
);

const canEdit = computed(
  () =>
    !isOwnCompletion.value &&
    auth.hasPermission(permissions.completion.edit, props.completion.format_id),
);

const isActionsDisabled = computed(() => toValue(actions.disabled) ?? false);
const showActions = computed(
  () =>
    actions.shouldShowActions == null ||
    actions.shouldShowActions(props.completion),
);
</script>

<template>
  <div>
    <CompletionProofs
      :subm-notes="completion.subm_notes"
      :proof-images="completion.subm_proof_img"
      :proof-videos="completion.subm_proof_vid"
    >
      <template v-if="acceptedByUser" #notes-footer>
        <p class="text-(--color-text-muted) mt-2 ml-4 italic flex items-center">
          <span class="mr-1">Completion approved by</span>
          <UserEntry :user="acceptedByUser" inline class="ml-2" />
        </p>
      </template>
    </CompletionProofs>

    <!-- Admin actions -->
    <div
      v-if="
        showActions &&
        (canEdit ||
          (isPending &&
            !isOwnCompletion &&
            (actions.onApprove || actions.onReject)))
      "
      class="flex justify-end gap-2 mb-4"
    >
      <Button
        v-if="isPending && !isOwnCompletion && actions.onReject"
        :disabled="isActionsDisabled"
        @click="actions.onReject!(completion)"
      >
        Reject
      </Button>
      <Button
        v-if="isPending && !isOwnCompletion && actions.onApprove"
        :disabled="isActionsDisabled"
        @click="actions.onApprove!(completion)"
      >
        Approve
      </Button>
      <LinkButton
        v-if="canEdit"
        :to="`/completions/${completion.id}/edit`"
        :disabled="isActionsDisabled"
      >
        Edit
      </LinkButton>
    </div>
  </div>
</template>
