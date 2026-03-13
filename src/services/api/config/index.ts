import type { Config } from './types';
import { apiRequest } from '../client';

/**
 * GET /api/config
 */
export async function getConfig(): Promise<Config> {
  return apiRequest<Config>('/api/config');
}
