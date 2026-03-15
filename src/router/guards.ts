import { watch } from 'vue';
import type { NavigationGuard } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

export const requireAuth: NavigationGuard = () => {
  const auth = useAuthStore();
  if (!auth.isAuthenticated) return '/';
  if (auth.isLoading) {
    return new Promise((resolve) => {
      const stop = watch(
        () => auth.isLoading,
        (loading) => {
          if (!loading) {
            stop();
            resolve(auth.isAuthenticated ? true : '/');
          }
        },
        { immediate: true },
      );
    });
  }
  return true;
};
