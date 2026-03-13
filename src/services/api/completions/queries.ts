import { useQuery, type UseQueryOptions } from '@tanstack/vue-query';
import { getCompletions } from './index';
import type { Completion, GetCompletionsParams } from './types';
import type { PaginatedResponse } from '@/services/api/common/types';

export const completionQueryKeys = {
  all: ['completions'] as const,
  list: (params?: GetCompletionsParams) => ['completions', params] as const,
} as const;

/**
 * Query hook to fetch completions with optional filters
 */
export function useCompletions(
  params?: GetCompletionsParams,
  options?: Omit<UseQueryOptions<PaginatedResponse<Completion>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: completionQueryKeys.list(params),
    queryFn: () => getCompletions(params),
    ...options,
  });
}
