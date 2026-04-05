import type {
  MapSubmission,
  GetMapSubmissionsParams,
  GetMapSubmissionParams,
  CreateMapSubmissionRequest,
  CreateMapSubmissionResponse,
} from './types';
import type { PaginatedResponse } from '@/services/api/common/types';
import { apiRequest } from '../client';

const BASE_PATH = '/api/maps/submissions';

function buildListParams(params?: GetMapSubmissionsParams): string {
  if (!params) return '';

  const searchParams = new URLSearchParams();

  if (params.page != null) searchParams.set('page', params.page.toString());
  if (params.per_page != null) searchParams.set('per_page', params.per_page.toString());
  if (params.format_id != null) searchParams.set('format_id', params.format_id.toString());
  if (params.submitter_id != null) searchParams.set('submitter_id', params.submitter_id);
  if (params.status != null) searchParams.set('status', params.status);
  if (params.include != null) searchParams.set('include', params.include);

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * GET /maps/submissions
 */
export async function getMapSubmissions(
  params?: GetMapSubmissionsParams,
): Promise<PaginatedResponse<MapSubmission>> {
  const queryString = buildListParams(params);
  return apiRequest<PaginatedResponse<MapSubmission>>(`${BASE_PATH}${queryString}`);
}

/**
 * GET /maps/submissions/{id}
 */
export async function getMapSubmission(
  id: number,
  params?: GetMapSubmissionParams,
): Promise<MapSubmission> {
  const searchParams = new URLSearchParams();
  if (params?.include != null) searchParams.set('include', params.include);
  const queryString = searchParams.toString();
  return apiRequest<MapSubmission>(`${BASE_PATH}/${id}${queryString ? `?${queryString}` : ''}`);
}

/**
 * POST /maps/submissions
 *
 * Create a map submission. Requires Discord OAuth and create:map_submission permission.
 */
export async function createMapSubmission(
  data: CreateMapSubmissionRequest,
): Promise<CreateMapSubmissionResponse> {
  const formData = new FormData();
  formData.append('code', data.code);
  formData.append('format_id', data.format_id.toString());
  formData.append('proposed', data.proposed.toString());
  formData.append('completion_proof', data.completion_proof);
  if (data.subm_notes != null) formData.append('subm_notes', data.subm_notes);

  return apiRequest<CreateMapSubmissionResponse>(BASE_PATH, {
    method: 'POST',
    body: formData,
  });
}

/**
 * DELETE /maps/submissions/{id}
 *
 * Delete own pending submission. Owner only.
 */
export async function deleteMapSubmission(id: number): Promise<void> {
  return apiRequest<void>(`${BASE_PATH}/${id}`, { method: 'DELETE' });
}

/**
 * PUT /maps/submissions/{id}/reject
 *
 * Reject a pending submission. Requires edit:map_submission permission.
 */
export async function rejectMapSubmission(id: number): Promise<void> {
  return apiRequest<void>(`${BASE_PATH}/${id}/reject`, { method: 'PUT' });
}
