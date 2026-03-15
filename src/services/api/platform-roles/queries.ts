import { useQuery, type UseQueryOptions } from '@tanstack/vue-query';
import { getPlatformRoles } from './index';
import type { PlatformRole } from './types';

export const platformRoleQueryKeys = {
  all: ['platform-roles'] as const,
} as const;

export function usePlatformRoles(
  options?: Omit<UseQueryOptions<PlatformRole[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: platformRoleQueryKeys.all,
    queryFn: getPlatformRoles,
    ...options,
  });
}
