import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string | null>(localStorage.getItem('auth_token'));
  const isAuthenticated = computed(() => !!token.value);

  // Actions
  function setToken(accessToken: string) {
    token.value = accessToken;
    localStorage.setItem('auth_token', accessToken);
  }

  function logout() {
    token.value = null;
    localStorage.removeItem('auth_token');
  }

  return {
    token,
    isAuthenticated,
    setToken,
    logout,
  };
});
