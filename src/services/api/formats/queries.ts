import { useQuery, type UseQueryOptions } from '@tanstack/vue-query';
import { getFormats } from './index';
import type { Format, PaginatedResponse } from './types';

export const formatQueryKeys = {
  all: ['formats'] as const,
} as const;

/**
 * Query hook to fetch all formats
 */
export function useFormats(
  options?: Omit<UseQueryOptions<PaginatedResponse<Format>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: formatQueryKeys.all,
    queryFn: getFormats,
    ...options,
  });
}
