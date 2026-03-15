<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useCompletions } from '@/services/api/completions/queries';
import type { GetCompletionsParams } from '@/services/api/completions/types';
import CompletionRow from '@/components/completions/CompletionRow.vue';
import CompletionRowSkeleton from '@/components/completions/CompletionRowSkeleton.vue';
import CompletionDetailLoader from '@/components/completions/CompletionDetailLoader.vue';
import UserEntry from '@/components/users/UserEntry.vue';
import UserEntrySkeleton from '@/components/users/UserEntrySkeleton.vue';
import Pagination from '@/components/ui/Pagination.vue';
import { formatDate } from '@/utils/dates';

const props = withDefaults(defineProps<{
  params: Omit<GetCompletionsParams, 'page' | 'per_page' | 'include'>;
  perPage?: number;
  editUrl?: (completionId: number) => string;
  emptyMessage?: string;
}>(), {
  perPage: 25,
  emptyMessage: 'No completions yet.',
});

const page = ref(1);

const { data: response, isLoading } = useCompletions(
  computed(() => ({
    ...props.params,
    page: page.value,
    per_page: props.perPage,
    include: 'players.flair',
  })),
);

const completions = computed(() => response.value?.data ?? []);

const cachedMeta = ref(response.value?.meta);
watch(() => response.value?.meta, (meta) => {
  if (meta) cachedMeta.value = meta;
});

const expandedIds = ref(new Set<number>());

function toggleDetail(id: number) {
  const next = new Set(expandedIds.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  expandedIds.value = next;
}
</script>

<template>
  <!-- Loading -->
  <template v-if="isLoading">
    <CompletionRowSkeleton v-for="i in perPage" :key="i">
      <UserEntrySkeleton />
    </CompletionRowSkeleton>
  </template>

  <!-- Loaded -->
  <template v-else-if="completions.length > 0">
    <CompletionRow
      v-for="completion in completions"
      :key="completion.id"
      :completion="completion"
      :expanded="expandedIds.has(completion.id)"
      v-bind="editUrl ? { editUrl: editUrl(completion.id) } : {}"
      @toggle-detail="toggleDetail(completion.id)"
    >
      <div v-for="player in completion.players" :key="player.discord_id">
        <UserEntry
          :user="player"
          :label="formatDate(completion.submitted_on)"
        />
      </div>
      <template #detail>
        <CompletionDetailLoader :completion-id="completion.id" />
      </template>
    </CompletionRow>
  </template>

  <p v-else class="text-center text-(--color-text-muted)">
    {{ emptyMessage }}
  </p>

  <Pagination
    v-if="cachedMeta"
    :current-page="cachedMeta.current_page"
    :last-page="cachedMeta.last_page"
    :disabled="isLoading"
    @update:current-page="page = $event"
  />
</template>
