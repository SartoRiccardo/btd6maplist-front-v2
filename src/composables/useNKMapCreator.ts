import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { getCustomMap, getBtd6User } from '@/services/ninjakiwi';

/**
 * Fetches the map creator from the NinjaKiwi API as a fallback
 * when a map has no creators registered on the maplist.
 *
 * Only fires requests when `enabled` is true (i.e. no maplist creators).
 */
export function useNKMapCreator(
  code: MaybeRefOrGetter<string>,
  enabled: MaybeRefOrGetter<boolean>,
) {
  const { data: nkMap, isLoading: isMapLoading } = useQuery({
    queryKey: computed(() => ['nk', 'map', toValue(code)]),
    queryFn: () => getCustomMap(toValue(code)),
    enabled: computed(() => toValue(enabled)),
    staleTime: 24 * 60 * 60 * 1000,
  });

  const creatorUid = computed(() => {
    if (!nkMap.value?.creator) return null;
    return nkMap.value.creator.match(/\/(\w+)$/)?.[1] ?? null;
  });

  const { data: nkUser, isLoading: isUserLoading } = useQuery({
    queryKey: computed(() => ['nk', 'user', creatorUid.value]),
    queryFn: () => getBtd6User(creatorUid.value!),
    enabled: computed(() => creatorUid.value != null),
    staleTime: 24 * 60 * 60 * 1000,
  });

  const isLoading = computed(() => isMapLoading.value || isUserLoading.value);

  return {
    creatorName: computed(() => nkUser.value?.displayName ?? null),
    creatorAvatar: computed(() => nkUser.value?.avatarURL ?? null),
    isLoading,
  };
}
