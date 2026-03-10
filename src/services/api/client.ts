import { useAuthStore } from '@/stores/auth';

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

async function getAuthToken(): Promise<string | null> {
  // Check if we're in a Vue component context
  try {
    const authStore = useAuthStore();
    return authStore.token;
  } catch {
    // Not in Vue context, return null
    return null;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();
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
