<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useMapSubmissions } from '@/services/api/map-submissions/queries';
import LinkButton from '@/components/ui/LinkButton.vue';
import MapSubmissionRow from '@/components/map-submissions/MapSubmissionRow.vue';
import Pagination from '@/components/ui/Pagination.vue';

const auth = useAuthStore();
const page = ref(1);

const { data: submissions, isLoading } = useMapSubmissions(
  computed(() => {
    if (!auth.user) return undefined;
    return {
      submitter_id: auth.user.discord_id,
      page: page.value,
      per_page: 25,
    };
  }),
  { enabled: computed(() => auth.user != null) },
);

const cachedMeta = ref(submissions.value?.meta);
watch(() => submissions.value?.meta, (meta) => {
  if (meta) cachedMeta.value = meta;
});
</script>

<template>
  <div>
    <h1 class="font-['Luckiest_Guy'] text-3xl md:text-4xl text-center mt-6 mb-4">
      My Submissions
    </h1>

    <div class="flex justify-center gap-4 mb-4">
      <LinkButton to="/my-submissions/maps" active>
        Map Submissions
      </LinkButton>
      <LinkButton to="/my-submissions/completions">
        Completion Submissions
      </LinkButton>
    </div>

    <p class="text-center text-(--color-text-muted) mb-6">
      Here are your pending and rejected map submissions.
    </p>

    <div v-if="isLoading" class="flex justify-center">
      <p class="text-(--color-text-muted)">Loading...</p>
    </div>

    <template v-else-if="submissions && submissions.data.length > 0">
      <MapSubmissionRow
        v-for="submission in submissions.data"
        :key="submission.id"
        :submission="submission"
        hide-submitter
      />
    </template>

    <p v-else class="text-center text-(--color-text-muted)">
      No pending or rejected map submissions.
    </p>

    <Pagination
      v-if="cachedMeta"
      :current-page="cachedMeta.current_page"
      :last-page="cachedMeta.last_page"
      :disabled="isLoading"
      @update:current-page="page = $event"
    />
  </div>
</template>
