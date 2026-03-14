import { computed, type MaybeRefOrGetter, toValue } from 'vue';
import { type UseQueryOptions, useQuery } from '@tanstack/vue-query';
import { getLeaderboard } from './index';
import type { GetLeaderboardParams, LeaderboardEntry } from './types';
import type { PaginatedResponse } from '@/services/api/common/types';

export const leaderboardQueryKeys = {
  all: ['leaderboard'] as const,
  list: (params?: GetLeaderboardParams) => ['leaderboard', params] as const,
} as const;

export function useLeaderboard(
  params: MaybeRefOrGetter<GetLeaderboardParams | undefined>,
  options?: Omit<UseQueryOptions<PaginatedResponse<LeaderboardEntry>>, 'queryFn' | 'queryKey'>
) {
  return useQuery({
    queryFn: () => getLeaderboard(toValue(params) as GetLeaderboardParams),
    queryKey: computed(() => leaderboardQueryKeys.list(toValue(params))),
    ...options,
  });
}
