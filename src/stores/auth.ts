import { ref, computed, watch } from 'vue';
import { defineStore } from 'pinia';
import { useQueryClient } from '@tanstack/vue-query';
import { useMe, userQueryKeys } from '@/services/api/users/queries';
import { setAuthToken, removeAuthToken } from '@/services/api/client';

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string | null>(localStorage.getItem('auth_token'));
  const isAuthenticated = computed(() => !!token.value);
  const queryClient = useQueryClient();

  // User query
  const userQuery = useMe(
    { include: ['flair', 'medals'] },
    {
      enabled: isAuthenticated,
    }
  );

  const user = userQuery.data;
  const isLoading = userQuery.isLoading;
  const isError = userQuery.isError;
  const refetch = userQuery.refetch;

  // Watch for errors and logout automatically
  watch(isError, (error) => {
    if (error) {
      console.error('Auth error - logging out');
      logout();
    }
  });

  // Watch for token changes and refetch user
  watch(isAuthenticated, (authenticated) => {
    if (authenticated && refetch) {
      refetch();
    }
  });

  // Actions
  function setToken(accessToken: string) {
    token.value = accessToken;
    setAuthToken(accessToken); // Use shared helper
  }

  function logout() {
    token.value = null;
    removeAuthToken();
    queryClient.resetQueries({ queryKey: userQueryKeys.me() });
  }

  return {
    token,
    user,
    isAuthenticated,
    isLoading,
    isError,
    setToken,
    logout,
    refetchUser: refetch,
  };
});
