import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/vue-query';
import {
  getRetroMaps,
  getRetroMap,
  createRetroMap,
  updateRetroMap,
  deleteRetroMap,
} from './index';
import type { RetroMap } from '@/services/api/maps/types';
import type {
  GetRetroMapsParams,
  CreateRetroMapRequest,
  UpdateRetroMapRequest,
} from './types';
import type { PaginatedResponse } from '@/services/api/common/types';

export const retroMapQueryKeys = {
  all: ['retro-maps'] as const,
  list: (params?: GetRetroMapsParams) => ['retro-maps', 'list', params] as const,
  detail: (id: number) => ['retro-maps', id] as const,
} as const;

/**
 * Query hook to fetch retro maps with optional filters.
 */
export function useRetroMaps(
  params?: MaybeRefOrGetter<GetRetroMapsParams | undefined>,
  options?: Omit<UseQueryOptions<PaginatedResponse<RetroMap>>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: computed(() => retroMapQueryKeys.list(toValue(params))),
    queryFn: () => getRetroMaps(toValue(params)),
    ...options,
  });
}

/**
 * Query hook to fetch a single retro map by ID.
 */
export function useRetroMap(
  id: MaybeRefOrGetter<number>,
  options?: Omit<UseQueryOptions<RetroMap>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: computed(() => retroMapQueryKeys.detail(toValue(id))),
    queryFn: () => getRetroMap(toValue(id)),
    ...options,
  });
}

/**
 * Mutation hook to create a retro map.
 */
export function useCreateRetroMap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRetroMapRequest) => createRetroMap(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: retroMapQueryKeys.all });
    },
  });
}

/**
 * Mutation hook to update a retro map.
 */
export function useUpdateRetroMap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRetroMapRequest }) =>
      updateRetroMap(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: retroMapQueryKeys.all });
    },
  });
}

/**
 * Mutation hook to delete a retro map.
 */
export function useDeleteRetroMap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteRetroMap(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: retroMapQueryKeys.all });
    },
  });
}
