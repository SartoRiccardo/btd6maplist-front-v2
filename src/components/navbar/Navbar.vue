<script setup lang="ts">
import { computed, ref } from "vue";
import { RouterLink } from "vue-router";
import DesktopNavbar from "./DesktopNavbar.vue";
import MobileNav from "./MobileNav.vue";
import { FORMAT_ICONS } from "@/constants/formats";
import { permissions } from "@/constants/permissions";
import { useAuthStore } from "@/stores/auth";
import type { NavItem } from "./types";

const authStore = useAuthStore();

const allAdminLinks = [
  {
    name: "Map Submissions",
    url: "/admin/submissions/maps",
    perms: [permissions.map.create],
  },
  {
    name: "Run Submissions",
    url: "/admin/submissions/completions",
    perms: [permissions.completion.edit, permissions.completion.delete],
  },
  {
    name: "User List",
    url: "/admin/users",
    perms: [permissions.user.ban, permissions.user.create],
  },
  {
    name: "List Configuration",
    url: "/admin/config",
    perms: [permissions.config.edit, permissions.formatPresentation.edit],
  },
  {
    name: "Retro Maps",
    url: "/admin/lists",
    perms: [
      permissions.retroMap.create,
      permissions.retroMap.edit,
      permissions.retroMap.delete,
    ],
  },
  {
    name: "Hidden Maps",
    url: "/admin/maps",
    perms: [
      permissions.map.create,
      permissions.map.edit,
      permissions.map.delete,
    ],
  },
];

const navItems = computed<NavItem[]>(() => {
  const items: NavItem[] = [];
  const userPerms = authStore.user?.permissions;
  const visibleAdminLinks = userPerms
    ? allAdminLinks.filter((link) =>
        link.perms.some((p) => (userPerms[p]?.length ?? 0) > 0),
      )
    : [];
  if (visibleAdminLinks.length > 0) {
    items.push({
      name: "Admin",
      children: visibleAdminLinks.map(({ name, url }) => ({ name, url })),
    });
  }
  items.push(
    {
      name: "Leaderboard",
      url: "/leaderboard",
    },
    {
      children: FORMAT_ICONS.filter((f) => f.slug).map((f) => ({
        icon_url: f.image,
        name: f.name,
        url: `/maps/${f.slug}`,
      })),
      name: "Maps",
    },
  );
  return items;
});

const isMobileMenuOpen = ref(false);

function openMobileMenu() {
  isMobileMenuOpen.value = true;
}
</script>

<template>
  <header
    class="flex px-8 py-4 text-[1.6rem] font-['Oswald'] font-bold uppercase relative z-50"
  >
    <!-- Logo (swaps to right on mobile) -->
    <RouterLink
      to="/"
      class="flex items-center no-underline text-(--color-text)! self-center hover:text-inherit! order-2 lg:order-1 ml-auto lg:ml-0"
    >
      <img
        alt="Logo"
        class="relative top-[-0.2rem] w-8 h-8 mr-4 rounded-full scale-150"
        src="/images/maplist.webp"
      />
      <span
        class="site-title font-['Luckiest_Guy'] text-[1.8rem] relative top-[0.1rem] hidden lg:inline"
        >BTD6 Maplist</span
      >
    </RouterLink>

    <nav class="navigation flex-1 self-center order-1 lg:order-2">
      <MobileNav
        :is-open="isMobileMenuOpen"
        :nav-items="navItems"
        @open="openMobileMenu"
      />
      <DesktopNavbar :nav-items="navItems" class="hidden lg:flex" />
    </nav>
  </header>
</template>
