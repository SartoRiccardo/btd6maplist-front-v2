export type { RetroMap } from "@/services/api/maps/types";

export interface GetRetroMapsParams {
  page?: number;
  per_page?: number;
  game_id?: number;
  category_id?: number;
  search?: string;
}

export interface GetRetroMapParams {
  // Currently no extra params, but kept for consistency
}

export interface CreateRetroMapRequest {
  name: string;
  sort_order: number;
  preview_url?: string;
  preview_file?: File;
  retro_game_id: number;
}

export interface UpdateRetroMapRequest {
  name: string;
  sort_order: number;
  preview_url?: string;
  preview_file?: File;
  retro_game_id: number;
}

export interface CreateRetroMapResponse {
  id: number;
}
