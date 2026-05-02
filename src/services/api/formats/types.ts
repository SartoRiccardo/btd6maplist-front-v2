import type { Map } from "@/services/api/maps/types";

export interface UpdateFormatRequest {
  name: string;
  hidden: boolean;
  run_submission_status: "closed" | "open" | "lcc_only";
  map_submission_status: "closed" | "open" | "open_chimps";
  emoji?: string | null;
  proposed_difficulties?: unknown[] | null;
  is_no_geraldo_enabled?: boolean | null;
  is_lcc_leaderboard_enabled: boolean;
  is_no_geraldo_leaderboard_enabled: boolean;
  is_black_border_leaderboard_enabled: boolean;
  map_submission_wh?: string | null;
  run_submission_wh?: string | null;
  slug?: string | null;
  description?: string | null;
  button_text?: string | null;
  preview_map_1_code?: string | null;
  preview_map_2_code?: string | null;
  preview_map_3_code?: string | null;
  map_submission_rules?: string | null;
  completion_submission_rules?: string | null;
  discord_server_url?: string | null;
}

export interface Format {
  id: number;
  name: string;
  slug: string;
  description: string;
  button_text: string;
  map_submission_rules: string;
  completion_submission_rules: string;
  discord_server_url: string | null;
  hidden: boolean;
  run_submission_status: "closed" | "open" | "lcc_only";
  map_submission_status: "closed" | "open" | "open_chimps";
  is_no_geraldo_enabled: boolean;
  is_lcc_leaderboard_enabled: boolean;
  is_no_geraldo_leaderboard_enabled: boolean;
  is_black_border_leaderboard_enabled: boolean;
  proposed_difficulties: string[] | null;
  map_submission_wh: string | null;
  run_submission_wh: string | null;
  preview_map1: Map | null;
  preview_map2: Map | null;
  preview_map3: Map | null;
}
