<script setup lang="ts">
import { computed, toValue } from "vue";
import { useIsFetching } from "@tanstack/vue-query";
import type { CompletionDetail } from "@/services/api/completions/types";
import type { User } from "@/services/api/users/types";
import { useAuthStore } from "@/stores/auth";
import { permissions } from "@/constants/permissions";
import { useCompletionActions } from "@/composables/useCompletionActions";
import {
  completionQueryKeys,
  usePinCompletion,
  useUnpinCompletion,
} from "@/services/api/completions/queries";
import { toast } from "vue-sonner";
import { useI18n } from "vue-i18n";
import { ApiError } from "@/services/api/client";
import UserEntry from "@/components/users/UserEntry.vue";
import LinkButton from "@/components/ui/LinkButton.vue";
import Button from "@/components/ui/Button.vue";
import CompletionProofs from "@/components/completions/CompletionProofs.vue";

const props = defineProps<{
  completion: CompletionDetail;
}>();

const { t } = useI18n({ inheritLocale: true });
const auth = useAuthStore();
const actions = useCompletionActions();
const {
  mutateAsync: pinCompletion,
  isPending: pinMutationPending,
} = usePinCompletion();
const {
  mutateAsync: unpinCompletion,
  isPending: unpinMutationPending,
} = useUnpinCompletion();

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

const isPinned = computed(() => props.completion.is_pinned === true);
// Stay "loading" through the mutation AND the refetch it triggers
const completionsFetching = useIsFetching({
  queryKey: completionQueryKeys.all,
});
const pinPending = computed(
  () =>
    pinMutationPending.value ||
    unpinMutationPending.value ||
    completionsFetching.value > 0,
);

const togglePin = () => {
  if (pinPending.value) return;
  try {
    isPinned.value
      ? unpinCompletion(props.completion.id)
      : pinCompletion(props.completion.id);
  } catch (error) {
    toast.error(
      error instanceof ApiError
        ? error.message
        : t("pinFailed"),
    );
  }
};

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
          <span class="mr-1">{{ t("approvedBy") }}</span>
          <UserEntry :user="acceptedByUser" inline class="ml-2" />
        </p>
      </template>
    </CompletionProofs>

    <!-- Actions -->
    <div
      v-if="
        showActions &&
        (isOwnCompletion ||
          canEdit ||
          (isPending &&
            !isOwnCompletion &&
            (actions.onApprove || actions.onReject)))
      "
      class="flex justify-end gap-2 mb-4"
    >
      <Button
        v-if="isOwnCompletion"
        :disabled="pinPending"
        @click="togglePin"
      >
        <i :class="isPinned ? 'bi bi-pin-fill' : 'bi bi-pin-angle'" class="mr-1" />
        {{ isPinned ? t("unpin") : t("pin") }}
      </Button>
      <Button
        v-if="canEdit && !completion.admin_note && actions.onAddNote"
        :disabled="isActionsDisabled"
        @click="actions.onAddNote!(completion)"
      >
        {{ t("addNote") }}
      </Button>
      <Button
        v-if="isPending && !isOwnCompletion && actions.onReject"
        :disabled="isActionsDisabled"
        @click="actions.onReject!(completion)"
      >
        {{ t("reject") }}
      </Button>
      <Button
        v-if="isPending && !isOwnCompletion && actions.onApprove"
        :disabled="isActionsDisabled"
        @click="actions.onApprove!(completion)"
      >
        {{ t("approve") }}
      </Button>
      <LinkButton
        v-if="canEdit"
        :to="`/completions/${completion.id}/edit`"
        :disabled="isActionsDisabled"
      >
        {{ t("common.edit") }}
      </LinkButton>
    </div>
  </div>
</template>

<i18n lang="json">
{
  "en": {
    "pin": "Pin",
    "unpin": "Unpin",
    "addNote": "Add Note",
    "approve": "Approve",
    "reject": "Reject",
    "approvedBy": "Completion approved by",
    "pinFailed": "Failed to update pin. Please try again."
  }
}
</i18n>
