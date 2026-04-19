import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import {
  getAchievementRoles,
  createAchievementRole,
  updateAchievementRole,
  deleteAchievementRole,
} from "./index";
import type { UpsertAchievementRoleRequest } from "./types";

export const achievementRoleQueryKeys = {
  list: (formatId: number) => ["achievement-roles", formatId] as const,
} as const;

export function useAchievementRoles(formatId: number) {
  return useQuery({
    queryKey: achievementRoleQueryKeys.list(formatId),
    queryFn: () => getAchievementRoles({ format_id: formatId, per_page: 100 }),
  });
}

export function useCreateAchievementRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpsertAchievementRoleRequest) =>
      createAchievementRole(data),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: achievementRoleQueryKeys.list(vars.lb_format),
      });
    },
  });
}

export function useUpdateAchievementRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpsertAchievementRoleRequest;
    }) => updateAchievementRole(id, data),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: achievementRoleQueryKeys.list(vars.data.lb_format),
      });
    },
  });
}

export function useDeleteAchievementRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number; formatId: number }) =>
      deleteAchievementRole(id),
    onSuccess: (_data, { formatId }) => {
      queryClient.invalidateQueries({
        queryKey: achievementRoleQueryKeys.list(formatId),
      });
    },
  });
}
