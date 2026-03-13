<script setup lang="ts">
import { RouterLink } from 'vue-router';
import DiscordLoginButton from './DiscordLoginButton.vue';
import Icon from '@/components/common/Icon.vue';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/stores/auth';
import { DEFAULT_AVATAR_URL } from '@/constants/user';

interface Props {
  onClose: () => void;
}

const { onClose } = defineProps<Props>();

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
      class="flex items-start gap-3"
    >
      <div class="aspect-square w-12 animate-pulse rounded-md border-2 border-[#E0E3FF] bg-gray-600"></div>
      <div class="flex-1">
        <div class="h-4 animate-pulse rounded bg-gray-600"></div>
      </div>
    </div>

    <!-- User profile -->
    <DropdownMenu v-else-if="authStore.isAuthenticated && authStore.user && !authStore.isLoading">
      <DropdownMenuTrigger as-child>
        <button class="flex items-center gap-3 w-full text-left">
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
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent class="bg-(--color-secondary) font-[Oswald] border-none w-(--reka-dropdown-menu-trigger-width)" side="top" :side-offset="25">
        <DropdownMenuItem as-child>
          <RouterLink
            :to="`/users/${authStore.user.discord_id}`"
            @click="onClose"
            class="flex text-xl! items-center rounded-lg px-4 font-bold uppercase text-(--color-text)! transition-colors duration-200 hover:bg-(--color-secondary)! cursor-pointer"
          >
            Profile
          </RouterLink>
        </DropdownMenuItem>
        <DropdownMenuItem as-child>
          <RouterLink
            to="/my-submissions/maps"
            @click="onClose"
            class="flex text-xl! items-center rounded-lg px-4 font-bold uppercase text-(--color-text)! transition-colors duration-200 hover:bg-(--color-secondary)! cursor-pointer"
          >
            My Submissions
          </RouterLink>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          @click="handleLogout"
          class="flex text-xl! items-center rounded-lg px-4 font-bold uppercase text-(--color-danger)! transition-colors duration-200 hover:bg-(--color-secondary)! cursor-pointer"
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <!-- Discord login -->
    <DiscordLoginButton v-else @success="onClose" class="w-full" />
  </div>
</template>
