import type { PlatformRole } from './types';
import type { PaginatedResponse } from '@/services/api/common/types';
import { apiRequest } from '../client';

const BASE_PATH = '/api/roles/platform';

export async function getPlatformRoles(): Promise<PlatformRole[]> {
  const response = await apiRequest<PaginatedResponse<PlatformRole>>(BASE_PATH);
  return response.data;
}
