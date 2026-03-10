import type {
  DiscordLoginResponse,
  DiscordCallbackRequest,
  DiscordCallbackSuccessResponse,
} from './types';
import { apiRequest } from '../client';

const BASE_PATH = '/web/oauth2/discord';

/**
 * POST /web/oauth2/discord/login
 *
 * Get Discord OAuth2 authorization URL for user to authorize.
 *
 * No request body required.
 *
 * Returns the Discord OAuth2 authorization URL to redirect the user to.
 */
export async function getDiscordLoginUrl(): Promise<DiscordLoginResponse> {
  return apiRequest<DiscordLoginResponse>(`${BASE_PATH}/login`, {
    method: 'POST',
  });
}

/**
 * POST /web/oauth2/discord/callback
 *
 * Handle Discord OAuth2 callback after user authorizes.
 *
 * Request body:
 * - code: OAuth authorization code (if successful)
 * - state: CSRF state parameter (required)
 * - error: OAuth error code (if user denied)
 *
 * Returns token and user info on success.
 */
export async function handleDiscordCallback(
  data: DiscordCallbackRequest
): Promise<DiscordCallbackSuccessResponse> {
  return apiRequest<DiscordCallbackSuccessResponse>(`${BASE_PATH}/callback`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
