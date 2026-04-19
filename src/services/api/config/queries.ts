import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/vue-query";
import { getConfig, updateConfig } from "./index";
import type { Config } from "./types";

export const configQueryKeys = {
  all: ["config"] as const,
} as const;

export function useConfig(
  options?: Omit<UseQueryOptions<Config>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: configQueryKeys.all,
    queryFn: getConfig,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useUpdateConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Config>) => updateConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configQueryKeys.all });
    },
  });
}
