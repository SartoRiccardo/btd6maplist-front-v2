<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import DesktopNavbar from './DesktopNavbar.vue';
import MobileNav from './MobileNav.vue';
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

const isMobileMenuOpen = ref(false);

function openMobileMenu() {
  isMobileMenuOpen.value = true;
}
</script>

<template>
  <header class="flex px-8 py-4 text-[1.6rem] font-['Oswald'] font-bold uppercase">
    <!-- Logo (swaps to right on mobile) -->
    <RouterLink to="/" class="flex items-center no-underline text-(--color-text)! self-center hover:text-inherit! order-2 lg:order-1 ml-auto lg:ml-0">
      <img
        alt="Logo"
        class="relative top-[-0.2rem] w-8 h-8 mr-4 rounded-full scale-150"
        src="/images/maplist.webp"
      />
      <span class="site-title font-['Luckiest_Guy'] text-[1.8rem] relative top-[0.1rem] hidden lg:inline">BTD6 Maplist</span>
    </RouterLink>

    <nav class="navigation flex-1 self-center order-1 lg:order-2">
      <MobileNav
        :is-open="isMobileMenuOpen"
        @open="openMobileMenu"
      />
      <DesktopNavbar :nav-items="navItems" class="hidden lg:flex" />
    </nav>
  </header>
</template>
