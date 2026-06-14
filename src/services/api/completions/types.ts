import type { Map, MapWithMetadata } from "@/services/api/maps/types";
import type { User } from "@/services/api/users/types";
import type { FilterOption, SortOrder } from "@/services/api/common/types";

export interface LCC {
  leftover: number;
}

export interface CompletionProofImage {
  url: string;
  is_added_by_admin: boolean;
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
  subm_proof_img: CompletionProofImage[];
  subm_proof_vid: string[];
  admin_note?: string | null;
  map: Map;
  is_current_lcc: boolean;
}

export interface CompletionWithMapMetadata extends Omit<Completion, "map"> {
  map: MapWithMetadata;
}

/** Show response — accepted_by can be a full User when ?include=accepted_by.flair */
export interface CompletionDetail extends Omit<Completion, "accepted_by"> {
  accepted_by: string | User | null;
}

export interface CompletionDetailWithMapMetadata extends Omit<
  CompletionDetail,
  "map"
> {
  map: MapWithMetadata;
}

export interface GetCompletionParams {
  timestamp?: number;
  include?: string;
}

export interface SubmitCompletionRequest {
  map: string;
  format_id: number;
  players: string[];
  proof_images: File[];
  black_border?: boolean;
  no_geraldo?: boolean;
  subm_notes?: string;
  proof_videos?: string[];
  lcc?: { leftover: number };
  is_video_proof_public: boolean;
}

export interface SubmitCompletionResponse {
  id: number;
}

export interface SaveCompletionRequest {
  map: string;
  format_id: number;
  players: string[];
  proof_images: File[];
  black_border: boolean | null;
  no_geraldo: boolean | null;
  subm_notes: string | null;
  proof_videos: string[];
  lcc: { leftover: number } | null;
  is_video_proof_public: boolean;
}

export interface UpdateCompletionRequest {
  format_id: number;
  players: string[];
  black_border: boolean | null;
  no_geraldo: boolean | null;
  lcc: { leftover: number } | null;
  accept: boolean;
  additional_image_proofs: (File | string)[];
}

export interface GetCompletionsParams {
  timestamp?: number;
  format_id?: number | number[];
  page?: number;
  per_page?: number;
  player_id?: string;
  map_code?: string;
  deleted?: FilterOption;
  pending?: FilterOption;
  no_geraldo?: FilterOption;
  lcc?: FilterOption;
  black_border?: FilterOption;
  sort_by?: "created_on";
  sort_order?: SortOrder;
  include?: string;
}
