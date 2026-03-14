import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { useQuery, type UseQueryOptions } from '@tanstack/vue-query';
import { getMaps, getMap } from './index';
import type { MapWithMetadata, MaybeGhostMap, GetMapsParams, GetMapParams } from './types';
import type { PaginatedResponse } from '@/services/api/common/types';

export const mapQueryKeys = {
  all: ['maps'] as const,
  list: (params?: GetMapsParams) => ['maps', 'list', params] as const,
  detail: (code: string, params?: GetMapParams) => ['maps', code, params] as const,
} as const;

/**
 * Query hook to fetch maps with optional filters.
 * Params can be reactive (ref, computed, or getter).
 * When fill_missing_retro is true, returns MaybeGhostMap[].
 */
export function useMaps(
  params: MaybeRefOrGetter<(GetMapsParams & { fill_missing_retro: true }) | undefined>,
  options?: Omit<UseQueryOptions<PaginatedResponse<MaybeGhostMap>>, 'queryKey' | 'queryFn'>
): ReturnType<typeof useQuery<PaginatedResponse<MaybeGhostMap>>>;
export function useMaps(
  params?: MaybeRefOrGetter<GetMapsParams | undefined>,
  options?: Omit<UseQueryOptions<PaginatedResponse<MapWithMetadata>>, 'queryKey' | 'queryFn'>
): ReturnType<typeof useQuery<PaginatedResponse<MapWithMetadata>>>;
export function useMaps(
  params?: MaybeRefOrGetter<GetMapsParams | undefined>,
  options?: Omit<UseQueryOptions<PaginatedResponse<MapWithMetadata | MaybeGhostMap>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: computed(() => mapQueryKeys.list(toValue(params))),
    queryFn: () => getMaps(toValue(params) as GetMapsParams),
    ...options,
  });
}

/**
 * Query hook to fetch a single map by code
 */
export function useMap(
  code: MaybeRefOrGetter<string>,
  params?: MaybeRefOrGetter<GetMapParams | undefined>,
  options?: Omit<UseQueryOptions<MapWithMetadata>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: computed(() => mapQueryKeys.detail(toValue(code), toValue(params))),
    queryFn: () => getMap(toValue(code), toValue(params)),
    ...options,
  });
}
