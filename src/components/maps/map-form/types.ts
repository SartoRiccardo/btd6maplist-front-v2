export interface AdditionalCode {
  code: string;
  description: string;
}

export interface CreatorEntry {
  user_id: string | null;
  role: string | null;
}

export interface VerifierEntry {
  user_id: string | null;
  version: string;
}

export interface MapInfoSlice {
  name: string;
  map_preview_url: string;
  custom_map_preview_file: File | null;
  r6_start: string;
  r6_start_file: File | null;
  aliases: string[];
  additional_codes: AdditionalCode[];
}

export interface RemakeOfValue {
  game_id: number;
  game_name: string;
  map_id: number;
  map_name: string;
}

export interface ListPlacementSlice {
  placement_curver: number | null;
  placement_allver: number | null;
  difficulty: number | null;
  botb_difficulty: number | null;
  remake_of: RemakeOfValue | null;
  optimal_heros: string[];
}

export interface CreditsSlice {
  creators: CreatorEntry[];
  verifiers: VerifierEntry[];
}

export interface MapFormModel
  extends MapInfoSlice, ListPlacementSlice, CreditsSlice {}

export function createDefaultFormModel(): MapFormModel {
  return {
    name: "",
    map_preview_url: "",
    custom_map_preview_file: null,
    r6_start: "",
    r6_start_file: null,
    aliases: [],
    additional_codes: [],
    placement_curver: null,
    placement_allver: null,
    difficulty: null,
    botb_difficulty: null,
    remake_of: null,
    optimal_heros: [],
    creators: [{ user_id: null, role: null }],
    verifiers: [{ user_id: null, version: "" }],
  };
}
