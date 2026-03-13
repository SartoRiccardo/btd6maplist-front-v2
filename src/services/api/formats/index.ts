import type { Format, PaginatedResponse } from './types';
import { apiRequest } from '../client';

const BASE_PATH = '/api/formats';

/**
 * GET /formats
 *
 * Fetch all formats (paginated, defaults to 100 per page).
 */
export async function getFormats(): Promise<PaginatedResponse<Format>> {
  return apiRequest<PaginatedResponse<Format>>(BASE_PATH);
}
