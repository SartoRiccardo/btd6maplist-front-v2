<script setup lang="ts">
import { RouterLink } from 'vue-router';
import DiscordLoginButton from './DiscordLoginButton.vue';
import { useAuthStore } from '@/stores/auth';
import { DEFAULT_AVATAR_URL } from '@/constants/user';

interface Props {
  onClose: () => void;
}

defineProps<Props>();

const authStore = useAuthStore();

function handleLogout() {
  authStore.logout();
  onClose();
}
</script>

<template>
  <div class="bg-(--color-secondary) px-4 py-4">
    <!-- Skeleton while loading -->
    <div
      v-if="authStore.isAuthenticated && authStore.isLoading"
      class="flex items-center gap-3"
    >
      <div class="aspect-square w-12 animate-pulse rounded-md border-2 border-[#E0E3FF] bg-gray-600"></div>
      <div class="flex-1">
        <div class="mb-2 h-4 animate-pulse rounded bg-gray-600"></div>
        <div class="h-3 animate-pulse rounded bg-gray-600 w-2/3"></div>
      </div>
    </div>

    <!-- User profile -->
    <div
      v-else-if="authStore.isAuthenticated && authStore.user && !authStore.isError"
      class="flex items-center gap-3"
    >
      <img
        :src="authStore.user.avatar_url || DEFAULT_AVATAR_URL"
        :alt="authStore.user.name"
        class="aspect-square w-12 rounded-md border-2 border-[#E0E3FF] object-cover"
      />
      <div class="min-w-0 flex-1">
        <div class="truncate font-bold uppercase">{{ authStore.user.name }}</div>
        <div class="flex gap-3">
          <RouterLink
            :to="`/users/${authStore.user.discord_id}`"
            @click="onClose"
            class="text-sm uppercase text-(--color-text-muted) hover:text-(--color-active)"
          >
            Profile
          </RouterLink>
          <RouterLink
            to="/my-submissions/maps"
            @click="onClose"
            class="text-sm uppercase text-(--color-text-muted) hover:text-(--color-active)"
          >
            Submissions
          </RouterLink>
        </div>
      </div>
      <button
        @click="handleLogout"
        class="rounded-lg bg-(--color-danger) p-2 text-white brightness-100 saturate-100 hover:brightness-110 hover:saturate-125"
        aria-label="Logout"
      >
        <i class="bi bi-box-arrow-right text-lg"></i>
      </button>
    </div>

    <!-- Discord login -->
    <DiscordLoginButton v-else @success="onClose" class="w-full" />
  </div>
</template>
