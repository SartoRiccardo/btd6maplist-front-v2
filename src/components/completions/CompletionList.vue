<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useCompletions } from '@/services/api/completions/queries';
import type { GetCompletionsParams } from '@/services/api/completions/types';
import type { FilterOption } from '@/services/api/common/types';
import CompletionRow from '@/components/completions/CompletionRow.vue';
import CompletionRowSkeleton from '@/components/completions/CompletionRowSkeleton.vue';
import CompletionDetailLoader from '@/components/completions/CompletionDetailLoader.vue';
import UserEntry from '@/components/users/UserEntry.vue';
import UserEntrySkeleton from '@/components/users/UserEntrySkeleton.vue';
import Button from '@/components/ui/Button.vue';
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
const filterBB = ref<FilterOption>('any');
const filterNoGeraldo = ref<FilterOption>('any');
const filterLCC = ref<FilterOption>('any');

function toggleBB() { filterBB.value = filterBB.value === 'any' ? 'only' : 'any'; page.value = 1; }
function toggleNoGeraldo() { filterNoGeraldo.value = filterNoGeraldo.value === 'any' ? 'only' : 'any'; page.value = 1; }
function toggleLCC() { filterLCC.value = filterLCC.value === 'any' ? 'only' : 'any'; page.value = 1; }

const { data: response, isLoading } = useCompletions(
  computed(() => ({
    ...props.params,
    page: page.value,
    per_page: props.perPage,
    include: 'players.flair',
    black_border: filterBB.value,
    no_geraldo: filterNoGeraldo.value,
    lcc: filterLCC.value,
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
  <div class="flex justify-end gap-1 mb-2">
    <Button :active="filterBB === 'only'" title="Black Border" @click="toggleBB">
      <img src="/images/medals/medal_bb.webp" class="w-[24px] h-[24px]" />
    </Button>
    <Button :active="filterNoGeraldo === 'only'" title="No Optimal Hero" @click="toggleNoGeraldo">
      <img src="/images/medals/medal_nogerry.webp" class="w-[24px] h-[24px]" />
    </Button>
    <Button :active="filterLCC === 'only'" title="Current LCC" @click="toggleLCC">
      <img src="/images/medals/medal_lcc.webp" class="w-[24px] h-[24px]" />
    </Button>
  </div>

  <!-- Loading -->
  <template v-if="isLoading">
    <CompletionRowSkeleton v-for="i in perPage" :key="i">
      <slot name="skeleton">
        <UserEntrySkeleton />
      </slot>
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
      <slot :completion="completion">
        <div v-for="player in completion.players" :key="player.discord_id">
          <UserEntry
            :user="player"
            :label="formatDate(completion.submitted_on)"
          />
        </div>
      </slot>
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
