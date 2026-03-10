// OAuth2 Discord Login Response
export interface DiscordLoginResponse {
  url: string; // Discord OAuth2 authorization URL
}

// OAuth2 Callback Request
export interface DiscordCallbackRequest {
  code?: string; // OAuth authorization code (if successful)
  state: string; // CSRF state parameter
  error?: string; // OAuth error code (if user denied)
}

// OAuth2 Callback Success Response
export interface DiscordCallbackSuccessResponse {
  token: string; // Discord access token
  user: {
    discord_id: string;
    name: string;
  };
}

// OAuth2 Callback Error Response
export interface DiscordCallbackErrorResponse {
  error: string;
  description?: string;
  message?: string;
}
