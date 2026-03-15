import type { MapWithMetadata, MapDetail, MaybeGhostMap, GetMapsParams, GetMapParams } from './types';
import type { PaginatedResponse } from '@/services/api/common/types';
import { apiRequest } from '../client';

const BASE_PATH = '/api/maps';

function buildMapsParams(params?: GetMapsParams): string {
  if (!params) return '';

  const searchParams = new URLSearchParams();

  if (params.timestamp != null) searchParams.set('timestamp', params.timestamp.toString());
  if (params.format_id != null) searchParams.set('format_id', params.format_id.toString());
  if (params.format_subfilter != null) searchParams.set('format_subfilter', params.format_subfilter.toString());
  if (params.page != null) searchParams.set('page', params.page.toString());
  if (params.per_page != null) searchParams.set('per_page', params.per_page.toString());
  if (params.deleted != null) searchParams.set('deleted', params.deleted);
  if (params.created_by != null) searchParams.set('created_by', params.created_by.toString());
  if (params.verified_by != null) searchParams.set('verified_by', params.verified_by.toString());
  if (params.fill_missing_retro) searchParams.set('fill_missing_retro', 'true');
  if (params.include != null) searchParams.set('include', params.include);
  if (params.medal_formats != null) searchParams.set('medal_formats', params.medal_formats.toString());

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

function buildMapParams(params?: GetMapParams): string {
  if (!params) return '';

  const searchParams = new URLSearchParams();

  if (params.timestamp != null) searchParams.set('timestamp', params.timestamp.toString());
  if (params.include != null) searchParams.set('include', params.include);

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * GET /maps
 */
export function getMaps(
  params: GetMapsParams & { fill_missing_retro: true }
): Promise<PaginatedResponse<MaybeGhostMap>>;
export function getMaps(
  params?: GetMapsParams
): Promise<PaginatedResponse<MapWithMetadata>>;
export function getMaps(
  params?: GetMapsParams
): Promise<PaginatedResponse<MapWithMetadata | MaybeGhostMap>> {
  const queryString = buildMapsParams(params);
  return apiRequest(`${BASE_PATH}${queryString}`);
}

/**
 * GET /maps/{code}
 */
export async function getMap(
  code: string,
  params?: GetMapParams
): Promise<MapDetail> {
  const queryString = buildMapParams(params);
  return apiRequest<MapDetail>(`${BASE_PATH}/${code}${queryString}`);
}
