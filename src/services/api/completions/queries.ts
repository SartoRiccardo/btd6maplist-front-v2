import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { useQuery, type UseQueryOptions } from '@tanstack/vue-query';
import { getCompletion, getCompletions } from './index';
import type { Completion, CompletionDetail, GetCompletionParams, GetCompletionsParams } from './types';
import type { PaginatedResponse } from '@/services/api/common/types';

export const completionQueryKeys = {
  all: ['completions'] as const,
  list: (params?: GetCompletionsParams) => ['completions', params] as const,
  detail: (id: number, params?: GetCompletionParams) => ['completions', id, params] as const,
} as const;

/**
 * Query hook to fetch completions with optional filters.
 * Params can be reactive (ref, computed, or getter).
 */
export function useCompletions(
  params?: MaybeRefOrGetter<GetCompletionsParams | undefined>,
  options?: Omit<UseQueryOptions<PaginatedResponse<Completion>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: computed(() => completionQueryKeys.list(toValue(params))),
    queryFn: () => getCompletions(toValue(params)),
    ...options,
  });
}

/**
 * Query hook to fetch a single completion by ID.
 */
export function useCompletion(
  id: MaybeRefOrGetter<number>,
  params?: MaybeRefOrGetter<GetCompletionParams | undefined>,
  options?: Omit<UseQueryOptions<CompletionDetail>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: computed(() => completionQueryKeys.detail(toValue(id), toValue(params))),
    queryFn: () => getCompletion(toValue(id), toValue(params)),
    ...options,
  });
}
