import type { FilterOption } from '@/services/api/common/types';

export interface Map {
  code: string;
  name: string;
  r6_start: number | null;
  map_data: unknown | null;
  map_preview_url: string;
  map_notes: string | null;
}

export interface RetroGame {
  id: number;
  game_id: number;
  category_id: number;
  subcategory_id: number;
  game_name: string;
  category_name: string;
  subcategory_name: string;
}

export interface RetroMap {
  id: number;
  name: string;
  sort_order: number;
  preview_url: string;
  retro_game_id: number;
  game: RetroGame;
}

/** Extended map fields — present on /maps index and /maps/{code} show */
export interface MapWithMetadata extends Map {
  placement_curver: number | null;
  placement_allver: number | null;
  difficulty: number | null;
  optimal_heros: string[] | null;
  botb_difficulty: number | null;
  remake_of: number | null;
  deleted_on: string | null;
  retro_map: RetroMap | null;
  is_verified: boolean;
}

export interface GetMapsParams {
  timestamp?: number;
  format_id?: number;
  format_subfilter?: number;
  page?: number;
  per_page?: number;
  deleted?: FilterOption;
  created_by?: number;
  verified_by?: number;
}

export interface GetMapParams {
  timestamp?: number;
  include?: string;
}
