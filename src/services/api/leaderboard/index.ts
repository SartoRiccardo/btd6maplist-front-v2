import type { GetLeaderboardParams, LeaderboardEntry } from './types';
import type { PaginatedResponse } from '@/services/api/common/types';
import { apiRequest } from '../client';

function buildLeaderboardParams(params: GetLeaderboardParams): string {
  const searchParams = new URLSearchParams();

  if (params.include != null) searchParams.set('include', params.include);
  if (params.page != null) searchParams.set('page', params.page.toString());
  if (params.per_page != null) searchParams.set('per_page', params.per_page.toString());
  if (params.value != null) searchParams.set('value', params.value);

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

export async function getLeaderboard(
  params: GetLeaderboardParams
): Promise<PaginatedResponse<LeaderboardEntry>> {
  const queryString = buildLeaderboardParams(params);
  return apiRequest<PaginatedResponse<LeaderboardEntry>>(
    `/api/formats/${params.format_id}/leaderboard${queryString}`
  );
}
