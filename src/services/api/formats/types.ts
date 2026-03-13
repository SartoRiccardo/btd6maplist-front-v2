import type { Map } from '@/services/api/maps/types';

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
  run_submission_status: 'closed' | 'open' | 'lcc_only';
  map_submission_status: 'closed' | 'open' | 'open_chimps';
  proposed_difficulties: string[] | null;
  preview_map1: Map | null;
  preview_map2: Map | null;
  preview_map3: Map | null;
}
