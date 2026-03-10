<script setup lang="ts">
import { RouterLink } from 'vue-router';
import Badge from './Badge.vue';
import { useDiscordAuth } from '@/composables/useDiscordAuth';

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

const { launchLoginWindow, isLoading } = useDiscordAuth();

async function handleDiscordLogin() {
  const result = await launchLoginWindow();

  if (result.type === 'success') {
    // TODO: Store token and user data in Pinia store
    console.log('Login successful:', result);
    // For now, just reload page to update auth state
    window.location.reload();
  } else if (result.type === 'canceled') {
    console.log('Login canceled by user');
  } else {
    console.error('Login failed:', result.error, result.message);
  }
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

        <!-- Discord Login Button -->
        <button
          @click="handleDiscordLogin"
          :disabled="isLoading"
          class="ml-2 flex items-center gap-2 bg-[#5865F2] text-[#E0E3FF] rounded-xl px-4 py-2 hover:cursor-pointer hover:bg-[#4752C4] transition-colors duration-200 ease disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Login with Discord"
        >
          <i class="bi bi-discord text-xl scale-150 mr-1 ml-1 translate-y-[-0.1rem]"></i>
          <span class="text-[1.6rem] font-['Oswald'] font-bold uppercase">
            {{ isLoading ? 'Loading...' : 'Login' }}
          </span>
        </button>
      </div>
    </nav>
  </header>
</template>
