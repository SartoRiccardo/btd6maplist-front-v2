<script setup lang="ts">
import { RouterLink } from 'vue-router';
import Badge from '@/components/common/Badge.vue';
import DiscordLoginButton from './DiscordLoginButton.vue';
import { useAuthStore } from '@/stores/auth';
import { DEFAULT_AVATAR_URL } from '@/constants/user';
import type { NavItem } from './types';

interface Props {
  navItems: NavItem[];
}

defineProps<Props>();

const authStore = useAuthStore();

function handleLogout() {
  authStore.logout();
}
</script>

<template>
  <div class="justify-end flex">
    <template
      v-for="item in navItems"
      :key="item.name"
    >
      <RouterLink
        v-if="item.url"
        :to="item.url"
        class="flex items-center no-underline text-(--color-text)! transition-colors duration-200 ease rounded-xl px-4 py-2 hover:cursor-pointer hover:bg-(--color-secondary) hover:text-inherit!"
      >
        {{ item.name }}
      </RouterLink>
      <span
        v-else
        class="relative group transition-colors duration-200 ease rounded-xl px-4 py-2 hover:cursor-pointer hover:bg-(--color-secondary)"
      >
        {{ item.name }}
        <div class="absolute right-0 top-full max-w-min min-w-70 pointer-events-none opacity-0 -translate-y-4 transition-all duration-200 ease pt-3 group-hover:pointer-events-auto group-hover:opacity-100 group-hover:translate-y-0 dropdown">
          <ul class="mt-2 mb-0 bg-(--color-secondary) px-4 py-2 rounded-lg list-none">
            <li
              v-for="child in item.children"
              :key="child.url"
              class="py-[0.1rem]"
            >
              <RouterLink :to="child.url" class="no-underline text-(--color-text)! inline-block w-full hover:text-(--color-active)!">
                <Badge v-if="child.icon_url" :src="child.icon_url" class="mr-0.5" />
                {{ child.name }}
              </RouterLink>
            </li>
          </ul>
        </div>
      </span>
    </template>

    <!-- Discord Login Button or User Profile -->
    <template v-if="authStore.isAuthenticated">
      <!-- Skeleton while loading user data -->
      <div
        v-if="authStore.isLoading"
        class="ml-2 w-12 h-12 bg-gray-600 rounded-md border-2 border-[#E0E3FF] animate-pulse"
      ></div>

      <!-- User profile picture -->
      <div
        v-else-if="authStore.user && !authStore.isError"
        class="ml-2 relative group transition-colors duration-200 ease rounded-xl hover:cursor-pointer translate-y-1"
      >
        <button
          class="w-12 h-12 overflow-hidden border-2 rounded-md border-[#E0E3FF] transition-colors cursor-pointer ml-2"
          :aria-label="`Logged in as ${authStore.user.name}`"
        >
          <img
            :src="authStore.user.avatar_url || DEFAULT_AVATAR_URL"
            :alt="authStore.user.name"
            class="w-full h-full object-cover"
          />
        </button>

        <!-- Dropdown menu -->
        <div class="absolute right-0 top-full max-w-min min-w-70 pointer-events-none opacity-0 -translate-y-4 transition-all duration-200 ease pt-3 group-hover:pointer-events-auto group-hover:opacity-100 group-hover:translate-y-0 dropdown cursor-default">
          <ul class="mt-2 mb-0 bg-(--color-secondary) px-4 py-2 rounded-lg list-none">
            <li class="py-[0.1rem]">
              <RouterLink :to="`/users/${authStore.user.discord_id}`" class="no-underline text-(--color-text)! inline-block w-full hover:text-(--color-active)!">
                Profile
              </RouterLink>
            </li>
            <li class="py-[0.1rem]">
              <RouterLink to="/my-submissions/maps" class="no-underline text-(--color-text)! inline-block w-full hover:text-(--color-active)!">
                My Submissions
              </RouterLink>
            </li>
            <li class="py-[0.1rem]">
              <hr class="border-(--color-contrast) my-1 opacity-50">
            </li>
            <li class="py-[0.1rem] flex items-center justify-between gap-4">
              <span class="text-(--color-text-muted) truncate max-w-50 normal-case">{{ authStore.user.name }}</span>
              <button
                @click="handleLogout"
                class="bg-(--color-danger) brightness-100 hover:brightness-110 saturate-100 hover:saturate-125 text-white px-3 py-2 rounded-lg text-sm cursor-pointer"
                aria-label="Logout"
              >
                <i class="bi bi-box-arrow-right"></i>
              </button>
            </li>
          </ul>
        </div>
      </div>

      <!-- Error state -->
      <button
        v-else
        @click="handleLogout"
        class="ml-2 flex items-center gap-2 bg-red-500 text-white rounded-xl px-4 py-2 hover:bg-red-600 transition-colors"
        aria-label="Logout due to error"
      >
        <i class="bi bi-exclamation-triangle"></i>
        <span class="text-sm">Error</span>
      </button>
    </template>

    <!-- Discord Login Button (not authenticated) -->
    <DiscordLoginButton v-else />
  </div>
</template>
