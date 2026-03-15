import type { Completion, CompletionDetail, GetCompletionParams, GetCompletionsParams } from './types';
import type { PaginatedResponse } from '@/services/api/common/types';
import { apiRequest } from '../client';

const BASE_PATH = '/api/completions';

function buildCompletionParams(params?: GetCompletionsParams): string {
  if (!params) return '';

  const searchParams = new URLSearchParams();

  if (params.timestamp != null) searchParams.set('timestamp', params.timestamp.toString());
  if (params.format_id != null) {
    searchParams.set('format_id', Array.isArray(params.format_id) ? params.format_id.join(',') : params.format_id.toString());
  }
  if (params.page != null) searchParams.set('page', params.page.toString());
  if (params.per_page != null) searchParams.set('per_page', params.per_page.toString());
  if (params.player_id != null) searchParams.set('player_id', params.player_id.toString());
  if (params.map_code != null) searchParams.set('map_code', params.map_code);
  if (params.deleted != null) searchParams.set('deleted', params.deleted);
  if (params.pending != null) searchParams.set('pending', params.pending);
  if (params.no_geraldo != null) searchParams.set('no_geraldo', params.no_geraldo);
  if (params.lcc != null) searchParams.set('lcc', params.lcc);
  if (params.black_border != null) searchParams.set('black_border', params.black_border);
  if (params.sort_by != null) searchParams.set('sort_by', params.sort_by);
  if (params.sort_order != null) searchParams.set('sort_order', params.sort_order);
  if (params.include != null) searchParams.set('include', params.include);

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * GET /completions
 *
 * Fetch completions with optional filters.
 */
export async function getCompletions(
  params?: GetCompletionsParams
): Promise<PaginatedResponse<Completion>> {
  const queryString = buildCompletionParams(params);
  return apiRequest<PaginatedResponse<Completion>>(`${BASE_PATH}${queryString}`);
}

/**
 * GET /completions/{id}
 *
 * Fetch a single completion by ID.
 */
export async function getCompletion(
  id: number,
  params?: GetCompletionParams
): Promise<CompletionDetail> {
  const searchParams = new URLSearchParams();
  if (params?.timestamp != null) searchParams.set('timestamp', params.timestamp.toString());
  if (params?.include != null) searchParams.set('include', params.include);
  const queryString = searchParams.toString();
  return apiRequest<CompletionDetail>(`${BASE_PATH}/${id}${queryString ? `?${queryString}` : ''}`);
}
