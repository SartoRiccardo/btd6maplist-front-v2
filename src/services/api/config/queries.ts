import { useQuery, type UseQueryOptions } from '@tanstack/vue-query';
import { getConfig } from './index';
import type { Config } from './types';

export const configQueryKeys = {
  all: ['config'] as const,
} as const;

/**
 * Query hook to fetch app config.
 * Config rarely changes — cached aggressively.
 */
export function useConfig(
  options?: Omit<UseQueryOptions<Config>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: configQueryKeys.all,
    queryFn: getConfig,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}
