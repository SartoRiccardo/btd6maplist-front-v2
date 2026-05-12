import { computed, toValue, type MaybeRefOrGetter } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { search } from "./index";
import type { SearchParams } from "./types";

export const searchQueryKeys = {
  results: (params: SearchParams) => ["search", params] as const,
} as const;

export function useSearch(params: MaybeRefOrGetter<SearchParams | null>) {
  return useQuery({
    queryKey: computed(() =>
      searchQueryKeys.results(toValue(params) ?? { q: "" }),
    ),
    queryFn: () => search(toValue(params)!),
    enabled: () => toValue(params) !== null,
  });
}
