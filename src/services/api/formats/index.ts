import type { Format, UpdateFormatRequest } from "./types";
import type { PaginatedResponse } from "@/services/api/common/types";
import { api } from "../client";

const BASE_PATH = "/api/formats";

export async function getFormats(): Promise<PaginatedResponse<Format>> {
  return api.get<PaginatedResponse<Format>>(BASE_PATH);
}

export async function getFormat(id: number): Promise<Format> {
  return api.get<Format>(`${BASE_PATH}/${id}`);
}

export async function getFormatWithWebhooks(id: number): Promise<Format> {
  return api.get<Format>(`${BASE_PATH}/${id}?include=webhooks`);
}

export async function updateFormat(
  id: number,
  data: UpdateFormatRequest,
): Promise<void> {
  return api.put<void>(`${BASE_PATH}/${id}`, data);
}
