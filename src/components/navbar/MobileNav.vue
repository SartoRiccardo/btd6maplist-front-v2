<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import Badge from '@/components/common/Badge.vue';
import DiscordLoginButton from './DiscordLoginButton.vue';
import { useAuthStore } from '@/stores/auth';
import { DEFAULT_AVATAR_URL } from '@/constants/user';
import type { NavItem } from './types';

interface Props {
  isOpen: boolean;
  navItems: NavItem[];
}

defineProps<Props>();

const emit = defineEmits<{
  open: [];
}>();

const authStore = useAuthStore();
const isDrawerOpen = ref(false);

function openDrawer() {
  isDrawerOpen.value = true;
  emit('open');
}

function handleLogout() {
  authStore.logout();
  isDrawerOpen.value = false;
}
</script>

<template>
  <div class="lg:hidden">
    <Drawer v-model:open="isDrawerOpen" direction="left">
      <!-- Hamburger button -->
      <DrawerTrigger
        @click="openDrawer"
        class="flex items-center no-underline text-(--color-text)! transition-colors duration-200 ease rounded-xl px-4 py-2 hover:cursor-pointer bg-(--color-secondary)"
        aria-label="Toggle menu"
      >
        <i class="bi bi-list text-xl"></i>
      </DrawerTrigger>

      <DrawerContent class="h-[80vh] bg-(--color-secondary) text-(--color-text) border-(--color-contrast)">
        <div class="sr-only">
          <DrawerTitle>Navigation Menu</DrawerTitle>
        </div>
        <div class="max-h-[calc(80vh-2rem)] overflow-y-auto px-4 py-2">
          <ul class="list-none m-0 p-0">
            <template v-for="item in navItems" :key="item.name">
              <li class="mb-2">
                <!-- Simple link -->
                <RouterLink
                  v-if="item.url"
                  :to="item.url"
                  @click="isDrawerOpen = false"
                  class="flex items-center no-underline text-(--color-text)! transition-colors duration-200 ease rounded-xl px-4 py-3 hover:cursor-pointer hover:bg-(--color-secondary) hover:text-inherit!"
                >
                  {{ item.name }}
                </RouterLink>

                <!-- Dropdown item -->
                <div v-else>
                  <div class="px-4 py-2 font-bold text-(--color-text-muted) uppercase text-sm">
                    {{ item.name }}
                  </div>
                  <ul class="list-none m-0 pl-4">
                    <li v-for="child in item.children" :key="child.url" class="mb-1">
                      <RouterLink
                        :to="child.url"
                        @click="isDrawerOpen = false"
                        class="flex items-center no-underline text-(--color-text)! transition-colors duration-200 ease rounded-lg px-4 py-2 hover:cursor-pointer hover:bg-(--color-secondary) hover:text-inherit!"
                      >
                        <Badge v-if="child.icon_url" :src="child.icon_url" class="mr-2" />
                        {{ child.name }}
                      </RouterLink>
                    </li>
                  </ul>
                </div>
              </li>
            </template>
          </ul>

          <!-- Auth section -->
          <div class="mt-4 pt-4 border-t border-(--color-contrast)">
            <!-- Skeleton while loading -->
            <div
              v-if="authStore.isAuthenticated && authStore.isLoading"
              class="flex items-center gap-3 px-4 py-2"
            >
              <div class="w-12 h-12 bg-gray-600 rounded-md border-2 border-[#E0E3FF] animate-pulse"></div>
              <div class="flex-1">
                <div class="h-4 bg-gray-600 rounded animate-pulse mb-2"></div>
                <div class="h-3 bg-gray-600 rounded animate-pulse w-2/3"></div>
              </div>
            </div>

            <!-- User profile -->
            <div
              v-else-if="authStore.isAuthenticated && authStore.user && !authStore.isError"
              class="flex items-center gap-3 px-4 py-2"
            >
              <img
                :src="authStore.user.avatar_url || DEFAULT_AVATAR_URL"
                :alt="authStore.user.name"
                class="w-12 h-12 rounded-md border-2 border-[#E0E3FF] object-cover"
              />
              <div class="flex-1 min-w-0">
                <div class="font-bold truncate">{{ authStore.user.name }}</div>
                <div class="flex gap-3">
                  <RouterLink
                    :to="`/users/${authStore.user.discord_id}`"
                    @click="isDrawerOpen = false"
                    class="text-sm text-(--color-text-muted) hover:text-(--color-active)!"
                  >
                    Profile
                  </RouterLink>
                  <RouterLink
                    to="/my-submissions/maps"
                    @click="isDrawerOpen = false"
                    class="text-sm text-(--color-text-muted) hover:text-(--color-active)!"
                  >
                    Submissions
                  </RouterLink>
                </div>
              </div>
              <button
                @click="handleLogout"
                class="bg-(--color-danger) brightness-100 hover:brightness-110 saturate-100 hover:saturate-125 text-white p-2 rounded-lg cursor-pointer"
                aria-label="Logout"
              >
                <i class="bi bi-box-arrow-right text-lg"></i>
              </button>
            </div>

            <!-- Discord login -->
            <DiscordLoginButton v-else @success="isDrawerOpen = false" class="w-full" />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  </div>
</template>
