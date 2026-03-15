import type { User, UpdateUserRequest, GetUserParams } from './types';
import { apiRequest } from '../client';

const BASE_PATH = '/api/users';

/**
 * Build query string from GetUserParams
 */
function buildUserParams(params?: GetUserParams): string {
  if (!params) return '';

  const searchParams = new URLSearchParams();

  if (params.include && params.include.length > 0) {
    searchParams.set('include', params.include.join(','));
  }

  if (params.timestamp) {
    searchParams.set('timestamp', params.timestamp.toString());
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * GET /users/{id} or GET /users/@me
 *
 * Get any user by ID.
 * Supports @me alias for authenticated user.
 *
 * Query parameters:
 * - include: Comma-separated: flair,medals,achievement_roles
 * - timestamp: Unix timestamp for medal calculation (defaults to now)
 */
export async function getUser(id: string, params?: GetUserParams): Promise<User> {
  const queryString = buildUserParams(params);
  return apiRequest<User>(`${BASE_PATH}/${id}${queryString}`);
}

/**
 * Convenience function to get authenticated user (uses @me alias)
 */
export async function getMe(params?: GetUserParams): Promise<User> {
  return getUser('@me', params);
}

/**
 * PUT /users/{id} or PUT /users/@me
 *
 * Update a user.
 * Supports @me alias for authenticated user.
 *
 * Requires edit:self permission.
 *
 * Request schema:
 * - name: string (required, max 50 characters, must be unique)
 * - nk_oak: string | null (optional - Ninja Kiwi OpenAPI Key)
 */
export async function updateUser(
  id: string,
  data: UpdateUserRequest
): Promise<User> {
  return apiRequest<User>(`${BASE_PATH}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Convenience function to update authenticated user
 */
export async function updateCurrentUser(data: UpdateUserRequest): Promise<User> {
  return updateUser('@me', data);
}

/**
 * PUT /users/{id}/ban
 */
export async function banUser(id: string): Promise<void> {
  return apiRequest(`${BASE_PATH}/${id}/ban`, { method: 'PUT' });
}

/**
 * PUT /users/{id}/unban
 */
export async function unbanUser(id: string): Promise<void> {
  return apiRequest(`${BASE_PATH}/${id}/unban`, { method: 'PUT' });
}
