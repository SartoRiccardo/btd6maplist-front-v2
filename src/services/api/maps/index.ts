import type {
  MapWithMetadata, MapDetail, MaybeGhostMap,
  GetMapsParams, GetMapParams,
  CreateMapRequest, UpdateMapRequest, CreateMapResponse,
} from './types';
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

function buildMapFormData(data: CreateMapRequest | UpdateMapRequest): FormData {
  const fd = new FormData();

  if ('code' in data) fd.append('code', data.code);
  fd.append('name', data.name);

  if (data.r6_start != null) fd.append('r6_start', data.r6_start);
  if (data.r6_start_file != null) fd.append('r6_start_file', data.r6_start_file);
  if (data.map_preview_url != null) fd.append('map_preview_url', data.map_preview_url);
  if (data.custom_map_preview_file != null) fd.append('custom_map_preview_file', data.custom_map_preview_file);
  if (data.map_data != null) fd.append('map_data', data.map_data);
  if (data.map_notes != null) fd.append('map_notes', data.map_notes);
  if (data.placement_curver != null) fd.append('placement_curver', data.placement_curver.toString());
  if (data.placement_allver != null) fd.append('placement_allver', data.placement_allver.toString());
  if (data.difficulty != null) fd.append('difficulty', data.difficulty.toString());
  if (data.botb_difficulty != null) fd.append('botb_difficulty', data.botb_difficulty.toString());
  if (data.remake_of != null) fd.append('remake_of', data.remake_of.toString());

  if (data.optimal_heros) {
    for (const hero of data.optimal_heros) {
      fd.append('optimal_heros[]', hero);
    }
  }

  if (data.aliases) {
    for (const alias of data.aliases) {
      fd.append('aliases[]', alias);
    }
  }

  if (data.creators) {
    for (let i = 0; i < data.creators.length; i++) {
      const c = data.creators[i]!;
      fd.append(`creators[${i}][user_id]`, c.user_id);
      fd.append(`creators[${i}][role]`, c.role ?? '');
    }
  }

  if (data.verifiers) {
    for (let i = 0; i < data.verifiers.length; i++) {
      const v = data.verifiers[i]!;
      fd.append(`verifiers[${i}][user_id]`, v.user_id);
      fd.append(`verifiers[${i}][version]`, v.version != null ? v.version.toString() : '');
    }
  }

  return fd;
}

/**
 * POST /maps
 */
export async function createMap(data: CreateMapRequest): Promise<CreateMapResponse> {
  return apiRequest<CreateMapResponse>(BASE_PATH, {
    method: 'POST',
    body: buildMapFormData(data),
  });
}

/**
 * PUT /maps/{code}
 */
export async function updateMap(code: string, data: UpdateMapRequest): Promise<void> {
  return apiRequest<void>(`${BASE_PATH}/${code}`, {
    method: 'PUT',
    body: buildMapFormData(data),
  });
}

/**
 * DELETE /maps/{code}
 */
export async function deleteMap(code: string): Promise<void> {
  return apiRequest<void>(`${BASE_PATH}/${code}`, {
    method: 'DELETE',
  });
}
