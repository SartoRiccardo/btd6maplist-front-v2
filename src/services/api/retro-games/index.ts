import type { RetroGame, GetRetroGamesParams } from './types';
import type { PaginatedResponse } from '@/services/api/common/types';
import { apiRequest } from '../client';

const BASE_PATH = '/api/retro-games';

export async function getRetroGames(
  params?: GetRetroGamesParams,
): Promise<PaginatedResponse<RetroGame>> {
  const searchParams = new URLSearchParams();

  if (params?.page != null) searchParams.set('page', params.page.toString());
  if (params?.per_page != null) searchParams.set('per_page', params.per_page.toString());
  if (params?.include != null) searchParams.set('include', params.include);

  const queryString = searchParams.toString();
  return apiRequest<PaginatedResponse<RetroGame>>(
    queryString ? `${BASE_PATH}?${queryString}` : BASE_PATH,
  );
}
