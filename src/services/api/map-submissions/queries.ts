import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/vue-query';
import {
  getMapSubmissions,
  getMapSubmission,
  createMapSubmission,
  deleteMapSubmission,
  rejectMapSubmission,
} from './index';
import type {
  MapSubmission,
  GetMapSubmissionsParams,
  GetMapSubmissionParams,
  CreateMapSubmissionRequest,
} from './types';
import type { PaginatedResponse } from '@/services/api/common/types';

export const mapSubmissionQueryKeys = {
  all: ['map-submissions'] as const,
  list: (params?: GetMapSubmissionsParams) => ['map-submissions', params] as const,
  detail: (id: number, params?: GetMapSubmissionParams) => ['map-submissions', id, params] as const,
} as const;

/**
 * Query hook to fetch map submissions with optional filters.
 */
export function useMapSubmissions(
  params?: MaybeRefOrGetter<GetMapSubmissionsParams | undefined>,
  options?: Omit<UseQueryOptions<PaginatedResponse<MapSubmission>>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: computed(() => mapSubmissionQueryKeys.list(toValue(params))),
    queryFn: () => getMapSubmissions(toValue(params)),
    ...options,
  });
}

/**
 * Query hook to fetch a single map submission by ID.
 */
export function useMapSubmission(
  id: MaybeRefOrGetter<number>,
  params?: MaybeRefOrGetter<GetMapSubmissionParams | undefined>,
  options?: Omit<UseQueryOptions<MapSubmission>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: computed(() => mapSubmissionQueryKeys.detail(toValue(id), toValue(params))),
    queryFn: () => getMapSubmission(toValue(id), toValue(params)),
    ...options,
  });
}

/**
 * Mutation hook to create a map submission.
 */
export function useCreateMapSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMapSubmissionRequest) => createMapSubmission(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mapSubmissionQueryKeys.all });
    },
  });
}

/**
 * Mutation hook to delete own pending map submission.
 */
export function useDeleteMapSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteMapSubmission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mapSubmissionQueryKeys.all });
    },
  });
}

/**
 * Mutation hook to reject a pending map submission.
 */
export function useRejectMapSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => rejectMapSubmission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mapSubmissionQueryKeys.all });
    },
  });
}
