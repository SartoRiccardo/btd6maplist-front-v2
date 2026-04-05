import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { refDebounced } from '@vueuse/core';
import { useQuery } from '@tanstack/vue-query';
import { getCustomMap, type NKCustomMap } from '@/services/ninjakiwi';
import { getMap } from '@/services/api/maps';
import { ApiError } from '@/services/api/client';
import type { MapDetail } from '@/services/api/maps/types';

const CODE_LENGTH = 7;

export function useNKMapValidation(code: MaybeRefOrGetter<string>) {
  const debouncedCode = refDebounced(
    computed(() => toValue(code).trim().toUpperCase()),
    500,
  );

  const isValidLength = computed(() => debouncedCode.value.length === CODE_LENGTH);

  const nkQuery = useQuery<NKCustomMap | null>({
    queryKey: computed(() => ['nk', 'map', debouncedCode.value]),
    queryFn: () => getCustomMap(debouncedCode.value),
    enabled: isValidLength,
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });

  const nkMap = computed(() => nkQuery.data.value ?? null);
  const isCodeValid = computed(() => nkMap.value != null);

  const nkLoading = computed(
    () => isValidLength.value && nkQuery.isLoading.value,
  );

  const nkError = computed<string | null>(() => {
    if (!isValidLength.value) return null;
    if (nkQuery.isLoading.value) return null;
    if (nkQuery.isError.value) return 'Could not verify map code. Please try again.';
    if (nkQuery.isFetched.value && nkMap.value == null) return 'Invalid map code.';
    return null;
  });

  const maplistQuery = useQuery<MapDetail | null>({
    queryKey: computed(() => ['maps', debouncedCode.value]),
    queryFn: async () => {
      try {
        return await getMap(debouncedCode.value);
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) return null;
        throw e;
      }
    },
    enabled: isCodeValid,
    retry: 1,
  });

  const maplistMap = computed(() => maplistQuery.data.value ?? null);
  const maplistLoading = computed(
    () => isCodeValid.value && maplistQuery.isLoading.value,
  );

  return {
    nkMap,
    nkError,
    nkLoading,
    maplistMap,
    maplistLoading,
    isCodeValid,
  };
}
