import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/vue-query';
import { getUser, updateUser, updateCurrentUser, getMe } from './index';
import type { User, UpdateUserRequest, GetUserParams } from './types';

// Query Keys
export const userQueryKeys = {
  all: ['users'] as const,
  detail: (id: string, params?: GetUserParams) => ['users', id, params] as const,
  me: (params?: GetUserParams) => ['users', '@me', params] as const,
} as const;

/**
 * Query hook to fetch a user by ID
 *
 * @param id - User's Discord ID or '@me' for authenticated user
 * @param params - Optional query parameters (include, timestamp)
 * @param options - Additional TanStack Query options
 */
export function useUser(
  id: string,
  params?: GetUserParams,
  options?: Omit<UseQueryOptions<User>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: userQueryKeys.detail(id, params),
    queryFn: () => getUser(id, params),
    ...options,
  });
}

/**
 * Query hook to fetch authenticated user (uses @me alias)
 *
 * @param params - Optional query parameters (include, timestamp)
 * @param options - Additional TanStack Query options
 */
export function useMe(
  params?: GetUserParams,
  options?: Omit<UseQueryOptions<User>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: userQueryKeys.me(params),
    queryFn: () => getMe(params),
    ...options,
  });
}

/**
 * Mutation hook to update a user
 *
 * @param id - User's Discord ID or '@me' for authenticated user
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      updateUser(id, data),
    onSuccess: (_, variables) => {
      // Invalidate the specific user query to trigger refetch
      queryClient.invalidateQueries({
        queryKey:
          variables.id === '@me'
            ? userQueryKeys.me()
            : userQueryKeys.detail(variables.id),
      });
    },
  });
}

/**
 * Mutation hook to update the authenticated user (uses @me alias)
 */
export function useUpdateCurrentUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserRequest) => updateCurrentUser(data),
    onSuccess: () => {
      // Invalidate the @me query to trigger refetch
      queryClient.invalidateQueries({ queryKey: userQueryKeys.me() });
    },
  });
}
