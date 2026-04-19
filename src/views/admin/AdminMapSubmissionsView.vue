<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import {
  useMapSubmissions,
  useRejectMapSubmission,
} from "@/services/api/map-submissions/queries";
import type {
  MapSubmission,
  MapSubmissionStatus,
} from "@/services/api/map-submissions/types";
import MapSubmissionRow from "@/components/map-submissions/MapSubmissionRow.vue";
import Pagination from "@/components/ui/Pagination.vue";
import Button from "@/components/ui/Button.vue";
import ConfirmModal from "@/components/common/ConfirmModal.vue";
import { useAuthStore } from "@/stores/auth";
import { permissions } from "@/constants/permissions";
import { FORMAT_ICONS } from "@/constants/formats";

const authStore = useAuthStore();
const page = ref(1);

const statusFilters: { value: MapSubmissionStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];
const selectedStatus = ref<MapSubmissionStatus>("pending");

function selectStatus(status: MapSubmissionStatus) {
  if (selectedStatus.value === status) return;
  selectedStatus.value = status;
  page.value = 1;
}

const allowedFormats = computed(() => {
  const perms = authStore.user?.permissions;
  if (!perms) return [];
  const formatIds = perms[permissions.map.create];
  if (!formatIds) return [];
  if (formatIds.includes(null)) return FORMAT_ICONS.map((f) => f.id);
  return formatIds as number[];
});

const { data: submissions, isLoading } = useMapSubmissions(
  computed(() => {
    if (allowedFormats.value.length === 0) return undefined;
    return {
      format_ids: allowedFormats.value,
      status: selectedStatus.value,
      page: page.value,
      per_page: 25,
    };
  }),
  { enabled: computed(() => allowedFormats.value.length > 0) },
);

const cachedMeta = ref(submissions.value?.meta);
watch(
  () => submissions.value?.meta,
  (meta) => {
    if (meta) cachedMeta.value = meta;
  },
);

const rejectMutation = useRejectMapSubmission();
const confirmModal = ref<InstanceType<typeof ConfirmModal>>();

async function confirmReject(id: number) {
  const confirmed = await confirmModal.value?.confirm();
  if (!confirmed) return;
  rejectMutation.mutate(id);
}

function acceptUrl(submission: MapSubmission) {
  const params = new URLSearchParams({
    code: submission.code,
    creator_id: submission.submitter_id,
    creator_name: submission.submitter.name,
    proposed_difficulty: submission.proposed.toString(),
    format: submission.format_id.toString(),
  });
  return `/map/new?${params}`;
}
</script>

<template>
  <div>
    <h1
      class="font-['Luckiest_Guy'] text-3xl md:text-4xl text-center mt-6 mb-4"
    >
      Map Submissions
    </h1>

    <div class="flex justify-center gap-1.5 mb-6">
      <Button
        v-for="opt in statusFilters"
        :key="opt.value"
        :active="selectedStatus === opt.value"
        @click="selectStatus(opt.value)"
      >
        {{ opt.label }}
      </Button>
    </div>

    <div v-if="isLoading" class="flex justify-center">
      <p class="text-(--color-text-muted)">Loading...</p>
    </div>

    <template v-else-if="submissions && submissions.data.length > 0">
      <MapSubmissionRow
        v-for="submission in submissions.data"
        :key="submission.id"
        :submission="submission"
      >
        <template #buttons>
          <Button @click="confirmReject(submission.id)">
            <i class="bi bi-x-lg" />
          </Button>
          <RouterLink :to="acceptUrl(submission)" class="no-underline">
            <Button>
              <i class="bi bi-arrow-right" />
            </Button>
          </RouterLink>
        </template>
      </MapSubmissionRow>
    </template>

    <p v-else class="text-center text-(--color-text-muted)">
      No map submissions found.
    </p>

    <Pagination
      v-if="cachedMeta"
      :current-page="cachedMeta.current_page"
      :last-page="cachedMeta.last_page"
      :disabled="isLoading"
      @update:current-page="page = $event"
    />

    <ConfirmModal ref="confirmModal">
      <p class="text-center mb-0">Do you want to reject this submission?</p>
    </ConfirmModal>
  </div>
</template>
