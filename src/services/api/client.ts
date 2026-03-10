// Token storage key
const TOKEN_KEY = 'auth_token';

// Helper to get token from localStorage
function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

// Helper to set token in localStorage (exported for auth store to use)
export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

// Helper to remove token from localStorage (exported for auth store to use)
export function removeAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// Base API configuration
const API_BASE_URL = import.meta.env['VITE_API_BASE_URL'] || '';

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public response: unknown
  ) {
    super(`API Error ${status}: ${statusText}`);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Only set Content-Type for non-FormData requests
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new ApiError(
      response.status,
      response.statusText,
      responseText ? JSON.parse(responseText) : null
    );
  }

  return response.json() as Promise<T>;
}

// HTTP method helpers
export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, data: unknown | FormData) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  put: <T>(endpoint: string, data: unknown | FormData) =>
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  patch: <T>(endpoint: string, data: unknown | FormData) =>
    apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  delete: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'DELETE' }),
};
