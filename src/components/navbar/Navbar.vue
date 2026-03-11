<script setup lang="ts">
import { RouterLink } from 'vue-router';
import DesktopNavbar from './DesktopNavbar.vue';
import type { NavItem } from './types';

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
      <DesktopNavbar :nav-items="navItems" class="hidden lg:flex" />
    </nav>
  </header>
</template>
