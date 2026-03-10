import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<{ id: string; name: string; email: string } | null>(null);
  const token = ref<string | null>(null);
  const isAuthenticated = computed(() => !!token.value);

  // Actions
  function setUser(userData: { id: string; name: string; email: string }) {
    user.value = userData;
  }

  function setToken(accessToken: string) {
    token.value = accessToken;
  }

  function logout() {
    user.value = null;
    token.value = null;
  }

  return {
    user,
    token,
    isAuthenticated,
    setUser,
    setToken,
    logout,
  };
});
