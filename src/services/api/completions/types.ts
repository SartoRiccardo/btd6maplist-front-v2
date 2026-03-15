import type { Map, MapWithMetadata } from '@/services/api/maps/types';
import type { User } from '@/services/api/users/types';
import type { FilterOption, SortOrder } from '@/services/api/common/types';

export interface LCC {
  leftover: number;
}

export interface Completion {
  id: number;
  map_code: string;
  format_id: number;
  black_border: boolean;
  no_geraldo: boolean;
  deleted_on: string | null;
  accepted_by: string | null;
  lcc: LCC | null;
  players: User[];
  submitted_on: number;
  subm_notes: string | null;
  subm_proof_img: string[];
  subm_proof_vid: string[];
  map: Map;
  is_current_lcc: boolean;
}

export interface CompletionWithMapMetadata extends Omit<Completion, 'map'> {
  map: MapWithMetadata;
}

/** Show response — accepted_by can be a full User when ?include=accepted_by.flair */
export interface CompletionDetail extends Omit<Completion, 'accepted_by'> {
  accepted_by: string | User | null;
}

export interface CompletionDetailWithMapMetadata extends Omit<CompletionDetail, 'map'> {
  map: MapWithMetadata;
}

export interface GetCompletionParams {
  timestamp?: number;
  include?: string;
}

export interface GetCompletionsParams {
  timestamp?: number;
  format_id?: number;
  page?: number;
  per_page?: number;
  player_id?: string;
  map_code?: string;
  deleted?: FilterOption;
  pending?: FilterOption;
  no_geraldo?: FilterOption;
  lcc?: FilterOption;
  black_border?: FilterOption;
  sort_by?: 'created_on';
  sort_order?: SortOrder;
  include?: string;
}
