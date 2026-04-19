import type { RetroMap } from "@/services/api/maps/types";
import type {
  GetRetroMapsParams,
  CreateRetroMapRequest,
  CreateRetroMapResponse,
  UpdateRetroMapRequest,
} from "./types";
import type { PaginatedResponse } from "@/services/api/common/types";
import { apiRequest } from "../client";

const BASE_PATH = "/api/maps/retro";

function buildListParams(params?: GetRetroMapsParams): string {
  if (!params) return "";

  const searchParams = new URLSearchParams();

  if (params.page != null) searchParams.set("page", params.page.toString());
  if (params.per_page != null)
    searchParams.set("per_page", params.per_page.toString());
  if (params.game_id != null)
    searchParams.set("game_id", params.game_id.toString());
  if (params.category_id != null)
    searchParams.set("category_id", params.category_id.toString());
  if (params.search != null) searchParams.set("search", params.search);

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

/**
 * GET /maps/retro
 */
export async function getRetroMaps(
  params?: GetRetroMapsParams,
): Promise<PaginatedResponse<RetroMap>> {
  const queryString = buildListParams(params);
  return apiRequest<PaginatedResponse<RetroMap>>(`${BASE_PATH}${queryString}`);
}

/**
 * GET /maps/retro/{id}
 */
export async function getRetroMap(id: number): Promise<RetroMap> {
  return apiRequest<RetroMap>(`${BASE_PATH}/${id}`);
}

/**
 * POST /maps/retro
 */
export async function createRetroMap(
  data: CreateRetroMapRequest,
): Promise<CreateRetroMapResponse> {
  const fd = new FormData();
  fd.append("name", data.name);
  fd.append("sort_order", data.sort_order.toString());
  fd.append("retro_game_id", data.retro_game_id.toString());
  if (data.preview_file) fd.append("preview_file", data.preview_file);
  if (data.preview_url != null) fd.append("preview_url", data.preview_url);
  return apiRequest<CreateRetroMapResponse>(BASE_PATH, {
    method: "POST",
    body: fd,
  });
}

/**
 * PUT /maps/retro/{id}
 */
export async function updateRetroMap(
  id: number,
  data: UpdateRetroMapRequest,
): Promise<void> {
  const fd = new FormData();
  fd.append("name", data.name);
  fd.append("sort_order", data.sort_order.toString());
  fd.append("retro_game_id", data.retro_game_id.toString());
  if (data.preview_file) fd.append("preview_file", data.preview_file);
  if (data.preview_url != null) fd.append("preview_url", data.preview_url);
  return apiRequest<void>(`${BASE_PATH}/${id}`, { method: "PUT", body: fd });
}

/**
 * DELETE /maps/retro/{id}
 */
export async function deleteRetroMap(id: number): Promise<void> {
  return apiRequest<void>(`${BASE_PATH}/${id}`, { method: "DELETE" });
}
