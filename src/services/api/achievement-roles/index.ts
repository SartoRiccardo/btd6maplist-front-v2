import type { AchievementRole, UpsertAchievementRoleRequest } from "./types";
import type { PaginatedResponse } from "@/services/api/common/types";
import { api } from "../client";

const BASE_PATH = "/roles/achievement";

export async function getAchievementRoles(params: {
  format_id?: number;
  type?: string;
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<AchievementRole>> {
  const query = new URLSearchParams();
  if (params.format_id !== undefined) query.set("format_id", String(params.format_id));
  if (params.type !== undefined) query.set("type", params.type);
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.per_page !== undefined) query.set("per_page", String(params.per_page));
  return api.get<PaginatedResponse<AchievementRole>>(`${BASE_PATH}?${query.toString()}`);
}

export async function createAchievementRole(data: UpsertAchievementRoleRequest): Promise<AchievementRole> {
  return api.post<AchievementRole>(BASE_PATH, data);
}

export async function updateAchievementRole(id: number, data: UpsertAchievementRoleRequest): Promise<AchievementRole> {
  return api.put<AchievementRole>(`${BASE_PATH}/${id}`, data);
}

export async function deleteAchievementRole(id: number): Promise<void> {
  return api.delete<void>(`${BASE_PATH}/${id}`);
}
