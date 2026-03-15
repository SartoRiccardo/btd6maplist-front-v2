<script setup lang="ts">
import { useCompletion } from '@/services/api/completions/queries';
import CompletionDetail from './CompletionDetail.vue';
import CompletionDetailSkeleton from './CompletionDetailSkeleton.vue';

const props = defineProps<{
  completionId: number;
}>();

const { data: completion, isLoading } = useCompletion(
  () => props.completionId,
  { include: 'accepted_by.flair,players.flair' },
);
</script>

<template>
  <CompletionDetailSkeleton v-if="isLoading" />
  <CompletionDetail v-else-if="completion" :completion="completion" />
</template>
