import type { SearchResult, SearchParams } from './types';
import { apiRequest } from '../client';

/**
 * GET /api/search
 *
 * Search for users and/or maps by fuzzy match.
 * Requires at least 3 non-space characters in q.
 */
export async function search(params: SearchParams): Promise<SearchResult[]> {
  const searchParams = new URLSearchParams();
  searchParams.set('q', params.q);

  if (params.entities && params.entities.length > 0) {
    searchParams.set('entities', params.entities.join(','));
  }

  if (params.limit != null) {
    searchParams.set('limit', params.limit.toString());
  }

  return apiRequest<SearchResult[]>(`/api/search?${searchParams.toString()}`);
}
