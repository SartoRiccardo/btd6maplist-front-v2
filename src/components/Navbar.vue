<script setup lang="ts">
import { RouterLink } from 'vue-router';
import Badge from './Badge.vue';
import { useDiscordAuth } from '@/composables/useDiscordAuth';
import { useAuthStore } from '@/stores/auth';
import { DEFAULT_AVATAR_URL } from '@/constants/user';

interface NavChild {
  url: string;
  name: string;
  icon_url?: string;
}

interface NavItem {
  name: string;
  url?: string;
  children?: NavChild[];
}

const navItems: NavItem[] = [
  {
    name: 'Leaderboard',
    url: '/leaderboard',
  },
  {
    name: 'Maps',
    children: [
      { url: '/maps/maplist', name: 'Maplist', icon_url: '/images/list_icons/icon_curver.webp' },
      { url: '/maps/expert-list', name: 'Expert List', icon_url: '/images/list_icons/icon_hard.webp' },
      { url: '/maps/best-of-the-best', name: 'Best of the Best', icon_url: '/images/list_icons/icon_botb.png' },
      { url: '/maps/nostalgia-pack', name: 'Nostalgia Pack', icon_url: '/images/list_icons/icon_np_1.png' },
    ],
  },
];

const authStore = useAuthStore();
const { launchLoginWindow, isLoading: loginLoading } = useDiscordAuth();

async function handleDiscordLogin() {
  const result = await launchLoginWindow();

  if (result.type === 'success') {
    authStore.setToken(result.token);
  } else if (result.type === 'canceled') {
    console.log('Login canceled by user');
  } else {
    console.error('Login failed:', result.error, result.message);
  }
}

function handleLogout() {
  authStore.logout();
}
</script>

<template>
  <header class="flex px-8 py-4 text-[1.6rem] font-['Oswald'] font-bold uppercase">
    <RouterLink to="/" class="flex items-center no-underline text-(--color-text)! self-center hover:text-inherit!">
      <img
        alt="Logo"
        class="relative top-[-0.2rem] w-8 h-8 mr-4 rounded-full scale-150"
        src="/images/maplist.webp"
      />
      <span class="site-title font-['Luckiest_Guy'] text-[1.8rem] relative top-[0.1rem]">BTD6 Maplist</span>
    </RouterLink>
    
    <nav class="navigation flex-1 self-center">
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
            class="ml-2 relative group transition-colors duration-200 ease rounded-xl px-2 py-1 hover:cursor-pointer hover:bg-(--color-secondary)"
          >
            <button
              class="w-12 h-12 overflow-hidden border-2 rounded-md border-[#E0E3FF] transition-colors cursor-pointer"
              :aria-label="`Logged in as ${authStore.user.name}`"
            >
              <img
                :src="authStore.user.avatar_url || DEFAULT_AVATAR_URL"
                :alt="authStore.user.name"
                class="w-full h-full object-cover"
              />
            </button>

            <!-- Dropdown menu -->
            <div class="absolute right-0 top-full max-w-min min-w-70 pointer-events-none opacity-0 -translate-y-4 transition-all duration-200 ease pt-3 group-hover:pointer-events-auto group-hover:opacity-100 group-hover:translate-y-0 dropdown">
              <ul class="mt-2 mb-0 bg-(--color-secondary) px-4 py-2 rounded-lg list-none">
                <li class="py-[0.1rem]">
                  <RouterLink to="/profile" class="no-underline text-(--color-text)! inline-block w-full hover:text-(--color-active)!">
                    Profile
                  </RouterLink>
                </li>
                <li class="py-[0.1rem]">
                  <RouterLink to="/my-submissions/maps" class="no-underline text-(--color-text)! inline-block w-full hover:text-(--color-active)!">
                    My Submissions
                  </RouterLink>
                </li>
                <li class="py-[0.1rem] border-t border-gray-600 mt-1 pt-1">
                  <button
                    @click="handleLogout"
                    class="no-underline text-red-400! inline-block w-full text-left hover:text-red-300! transition-colors"
                  >
                    Logout
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
        <button
          v-else
          @click="handleDiscordLogin"
          :disabled="loginLoading"
          class="ml-2 flex items-center gap-2 bg-[#5865F2] text-[#E0E3FF] rounded-xl px-4 py-2 hover:cursor-pointer hover:bg-[#4752C4] transition-colors duration-200 ease disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Login with Discord"
        >
          <i class="bi bi-discord text-xl scale-150 mr-1 ml-1 translate-y-[-0.1rem]"></i>
          <span class="text-[1.6rem] font-['Oswald'] font-bold uppercase">
            {{ loginLoading ? 'Loading...' : 'Login' }}
          </span>
        </button>
      </div>
    </nav>
  </header>
</template>
