import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { useQuery, type UseQueryOptions } from '@tanstack/vue-query';
import { getCompletions } from './index';
import type { Completion, GetCompletionsParams } from './types';
import type { PaginatedResponse } from '@/services/api/common/types';

export const completionQueryKeys = {
  all: ['completions'] as const,
  list: (params?: GetCompletionsParams) => ['completions', params] as const,
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
