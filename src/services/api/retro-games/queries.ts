import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { useQuery, type UseQueryOptions } from '@tanstack/vue-query';
import { getRetroGames } from './index';
import type { RetroGame, GetRetroGamesParams } from './types';
import type { PaginatedResponse } from '@/services/api/common/types';

export const retroGameQueryKeys = {
  all: ['retro-games'] as const,
  list: (params?: GetRetroGamesParams) => ['retro-games', 'list', params] as const,
} as const;

export function useRetroGames(
  params?: MaybeRefOrGetter<GetRetroGamesParams | undefined>,
  options?: Omit<UseQueryOptions<PaginatedResponse<RetroGame>>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: computed(() => retroGameQueryKeys.list(toValue(params))),
    queryFn: () => getRetroGames(toValue(params)),
    ...options,
  });
}
