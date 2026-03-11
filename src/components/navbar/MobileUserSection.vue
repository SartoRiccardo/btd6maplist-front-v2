<script setup lang="ts">
import DiscordLoginButton from './DiscordLoginButton.vue';
import Icon from '@/components/common/Icon.vue';
import { useAuthStore } from '@/stores/auth';
import { DEFAULT_AVATAR_URL } from '@/constants/user';

interface Props {
  onClose: () => void;
}

defineProps<Props>();

const authStore = useAuthStore();
</script>

<template>
  <div class="bg-(--color-secondary) px-4 py-4">
    <!-- Skeleton while loading -->
    <div
      v-if="authStore.isAuthenticated && authStore.isLoading"
      class="flex items-start gap-3"
    >
      <div class="aspect-square w-12 animate-pulse rounded-md border-2 border-[#E0E3FF] bg-gray-600"></div>
      <div class="flex-1">
        <div class="h-4 animate-pulse rounded bg-gray-600"></div>
      </div>
    </div>

    <!-- User profile -->
    <div
      v-else-if="authStore.isAuthenticated && authStore.user && !authStore.isLoading"
      class="flex items-center gap-3"
    >
      <img
        :src="authStore.user.avatar_url || DEFAULT_AVATAR_URL"
        :alt="authStore.user.name"
        class="aspect-square w-12 rounded-md border-2 border-[#E0E3FF] object-cover"
      />
      <div class="min-w-0 flex-1">
        <div class="truncate font-bold uppercase text-xl">{{ authStore.user.name }}</div>
        <div v-if="authStore.user.medals" class="text-sm text-(--color-text-muted) flex items-center gap-2">
          <Icon src="/images/medals/medal_win.webp" /> {{ authStore.user.medals.wins }} Completions
        </div>
      </div>
    </div>

    <!-- Discord login -->
    <DiscordLoginButton v-else @success="onClose" class="w-full" />
  </div>
</template>
