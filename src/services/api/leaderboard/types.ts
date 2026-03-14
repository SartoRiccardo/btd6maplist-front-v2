import type { User } from '@/services/api/users/types';

export type LeaderboardValue = 'points' | 'lccs' | 'no_geraldo' | 'black_border';

export interface LeaderboardEntry {
  score: number;
  placement: number;
  user: User;
}

export interface GetLeaderboardParams {
  format_id: number;
  value?: LeaderboardValue;
  page?: number;
  per_page?: number;
  include?: string;
}
