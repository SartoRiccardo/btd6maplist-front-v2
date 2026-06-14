import type {
  Completion,
  CompletionDetail,
  GetCompletionParams,
  GetCompletionsParams,
  SaveCompletionRequest,
  SubmitCompletionRequest,
  SubmitCompletionResponse,
  UpdateCompletionRequest,
} from "./types";
import type { PaginatedResponse } from "@/services/api/common/types";
import { api, apiRequest } from "../client";

const BASE_PATH = "/api/completions";

function buildCompletionParams(params?: GetCompletionsParams): string {
  if (!params) return "";

  const searchParams = new URLSearchParams();

  if (params.timestamp != null)
    searchParams.set("timestamp", params.timestamp.toString());
  if (params.format_id != null) {
    searchParams.set(
      "format_id",
      Array.isArray(params.format_id)
        ? params.format_id.join(",")
        : params.format_id.toString(),
    );
  }
  if (params.page != null) searchParams.set("page", params.page.toString());
  if (params.per_page != null)
    searchParams.set("per_page", params.per_page.toString());
  if (params.player_id != null)
    searchParams.set("player_id", params.player_id.toString());
  if (params.map_code != null) searchParams.set("map_code", params.map_code);
  if (params.deleted != null) searchParams.set("deleted", params.deleted);
  if (params.pending != null) searchParams.set("pending", params.pending);
  if (params.no_geraldo != null)
    searchParams.set("no_geraldo", params.no_geraldo);
  if (params.lcc != null) searchParams.set("lcc", params.lcc);
  if (params.black_border != null)
    searchParams.set("black_border", params.black_border);
  if (params.sort_by != null) searchParams.set("sort_by", params.sort_by);
  searchParams.set("sort_order", params.sort_order ?? "desc");
  if (params.include != null) searchParams.set("include", params.include);

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

/**
 * GET /completions
 *
 * Fetch completions with optional filters.
 */
export async function getCompletions(
  params?: GetCompletionsParams,
): Promise<PaginatedResponse<Completion>> {
  const queryString = buildCompletionParams(params);
  return apiRequest<PaginatedResponse<Completion>>(
    `${BASE_PATH}${queryString}`,
  );
}

/**
 * GET /completions/{id}
 *
 * Fetch a single completion by ID.
 */
export async function getCompletion(
  id: number,
  params?: GetCompletionParams,
): Promise<CompletionDetail> {
  const searchParams = new URLSearchParams();
  if (params?.timestamp != null)
    searchParams.set("timestamp", params.timestamp.toString());
  if (params?.include != null) searchParams.set("include", params.include);
  const queryString = searchParams.toString();
  return apiRequest<CompletionDetail>(
    `${BASE_PATH}/${id}${queryString ? `?${queryString}` : ""}`,
  );
}

/**
 * POST /completions/submit
 *
 * Submit a completion for review.
 * Requires Discord OAuth and create:completion_submission permission.
 */
export async function submitCompletion(
  data: SubmitCompletionRequest,
): Promise<SubmitCompletionResponse> {
  const formData = new FormData();
  formData.append("map", data.map);
  formData.append("format_id", data.format_id.toString());
  for (const player of data.players) {
    formData.append("players[]", player);
  }
  for (const image of data.proof_images) {
    formData.append("proof_images[]", image);
  }
  if (data.black_border != null)
    formData.append("black_border", data.black_border ? "1" : "0");
  if (data.no_geraldo != null)
    formData.append("no_geraldo", data.no_geraldo ? "1" : "0");
  if (data.subm_notes != null) formData.append("subm_notes", data.subm_notes);
  if (data.proof_videos) {
    for (const video of data.proof_videos) {
      formData.append("proof_videos[]", video);
    }
  }
  if (data.lcc != null)
    formData.append("lcc[leftover]", data.lcc.leftover.toString());
  formData.append("is_video_proof_public", data.is_video_proof_public ? "1" : "0");

  return apiRequest<SubmitCompletionResponse>(`${BASE_PATH}/submit`, {
    method: "POST",
    body: formData,
  });
}

function buildCompletionFormData(data: SaveCompletionRequest): FormData {
  const formData = new FormData();
  formData.append("map", data.map);
  formData.append("format_id", data.format_id.toString());
  for (const player of data.players) {
    formData.append("players[]", player);
  }
  for (const image of data.proof_images) {
    formData.append("proof_images[]", image);
  }
  formData.append("black_border", data.black_border ? "1" : "0");
  formData.append("no_geraldo", data.no_geraldo ? "1" : "0");
  if (data.subm_notes != null) formData.append("subm_notes", data.subm_notes);
  if (data.proof_videos) {
    for (const video of data.proof_videos) {
      formData.append("proof_videos[]", video);
    }
  }
  if (data.lcc != null)
    formData.append("lcc[leftover]", data.lcc.leftover.toString());
  formData.append("is_video_proof_public", data.is_video_proof_public ? "1" : "0");
  return formData;
}

/**
 * POST /completions
 *
 * Admin-create a completion (auto-accepted). Requires edit:completion.
 */
export async function saveCompletion(
  data: SaveCompletionRequest,
): Promise<SubmitCompletionResponse> {
  return apiRequest<SubmitCompletionResponse>(BASE_PATH, {
    method: "POST",
    body: buildCompletionFormData(data),
  });
}

/**
 * PUT /completions/:id
 *
 * Update a completion. Requires edit:completion.
 * `accept` is silently ignored if already accepted.
 */
export async function updateCompletion(
  id: number,
  data: UpdateCompletionRequest,
): Promise<void> {
  const formData = new FormData();
  formData.append("format_id", data.format_id.toString());
  for (const player of data.players) {
    formData.append("players[]", player);
  }
  formData.append("black_border", data.black_border ? "1" : "0");
  formData.append("no_geraldo", data.no_geraldo ? "1" : "0");
  if (data.lcc != null)
    formData.append("lcc[leftover]", data.lcc.leftover.toString());
  formData.append("accept", data.accept ? "1" : "0");
  for (const item of data.additional_image_proofs) {
    formData.append("additional_image_proofs[]", item);
  }
  return apiRequest<void>(`${BASE_PATH}/${id}`, {
    method: "PUT",
    body: formData,
  });
}

/**
 * DELETE /completions/:id
 *
 * Soft-delete (reject) a completion. Requires edit:completion. Idempotent.
 */
export async function deleteCompletion(id: number): Promise<void> {
  return apiRequest<void>(`${BASE_PATH}/${id}`, { method: "DELETE" });
}

/**
 * PUT /completions/:id/admin-note
 *
 * Set or replace the admin note on a completion. Requires edit:completion.
 */
export async function setAdminNote(
  id: number,
  admin_note: string,
): Promise<void> {
  return api.put(`${BASE_PATH}/${id}/admin-note`, { admin_note });
}

/**
 * DELETE /completions/:id/admin-note
 *
 * Remove the admin note on a completion. Requires edit:completion. Idempotent.
 */
export async function deleteAdminNote(id: number): Promise<void> {
  return api.delete(`${BASE_PATH}/${id}/admin-note`);
}
