import type { FilterOption } from '@/services/api/common/types';
import type { RetroGame } from '@/services/api/retro-games/types';
import type { User } from '@/services/api/users/types';

export interface Map {
  code: string;
  name: string;
  r6_start: string | null;
  map_data: unknown | null;
  map_preview_url: string;
  map_notes: string | null;
}

export interface RetroMap {
  id: number;
  name: string;
  sort_order: number;
  preview_url: string;
  retro_game_id: number;
  game: RetroGame;
}

export interface MapMedals {
  completed: boolean;
  black_border: boolean;
  no_geraldo: boolean;
  current_lcc: boolean;
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
  medals?: MapMedals;
}

/** A backfilled retro map that hasn't been remade yet */
export interface GhostMap extends Omit<MapWithMetadata, 'code' | 'retro_map'> {
  code: null;
  retro_map: RetroMap;
}

export type MaybeGhostMap = MapWithMetadata | GhostMap;

export interface MapCreator {
  user_id: string;
  role: string | null;
  user: User;
}

export interface MapVerification {
  user_id: string;
  version: number | null;
  user: User;
}

/** Full map detail — returned by GET /maps/{code} */
export interface MapDetail extends MapWithMetadata {
  creators: MapCreator[];
  verifications: MapVerification[];
  aliases: string[];
}

export interface GetMapsParams {
  timestamp?: number;
  format_id?: number;
  format_subfilter?: string;
  fill_missing_retro?: boolean;
  page?: number;
  per_page?: number;
  deleted?: FilterOption;
  created_by?: number | string;
  verified_by?: number;
  include?: string;
  medal_formats?: number;
}

export interface GetMapParams {
  timestamp?: number;
  include?: string;
}
