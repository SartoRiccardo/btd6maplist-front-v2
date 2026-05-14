import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/vue-query";
import { getFormats, getFormat, getFormatWithWebhooks, updateFormat } from "./index";
import type { Format, UpdateFormatRequest } from "./types";
import type { PaginatedResponse } from "@/services/api/common/types";

export const formatQueryKeys = {
  all: ["formats"] as const,
  detail: (id: number) => ["formats", id] as const,
  detailWithWebhooks: (id: number) => ["formats", id, "webhooks"] as const,
} as const;

export function useFormats(
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Format>>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: formatQueryKeys.all,
    queryFn: getFormats,
    ...options,
  });
}

export function useFormat(id: number) {
  return useQuery({
    queryKey: formatQueryKeys.detail(id),
    queryFn: () => getFormat(id),
  });
}

export function useFormatWithWebhooks(id: number) {
  return useQuery({
    queryKey: formatQueryKeys.detailWithWebhooks(id),
    queryFn: () => getFormatWithWebhooks(id),
  });
}

export function useUpdateFormat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateFormatRequest }) =>
      updateFormat(id, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: formatQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: formatQueryKeys.all });
    },
  });
}
