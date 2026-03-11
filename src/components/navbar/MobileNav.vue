<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { Drawer, DrawerClose, DrawerContent, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
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
      <DrawerTrigger
        @click="openDrawer"
        class="flex items-center rounded-xl px-4 py-2 bg-(--color-secondary) text-(--color-text) transition-colors duration-200"
        aria-label="Toggle menu"
      >
        <i class="bi bi-list text-xl"></i>
      </DrawerTrigger>

      <DrawerContent class="h-screen bg-(--color-primary) text-(--color-text)">
        <div class="sr-only">
          <DrawerTitle>Navigation Menu</DrawerTitle>
        </div>
        <div class="flex flex-col h-full font-['Oswald']">
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-(--color-secondary) px-4 py-4">
            <div class="flex items-center gap-4">
              <img
                alt="Logo"
                src="/images/maplist.webp"
                class="w-8 h-8 translate-y-[-0.1rem] rounded-full scale-125"
              />
              <span class="font-['Luckiest_Guy'] text-[1.4rem] translate-y-[0.2rem] uppercase">
                BTD6 Maplist
              </span>
            </div>
            <DrawerClose
              @click="isDrawerOpen = false"
              class="rounded-lg p-2 text-(--color-text) transition-colors hover:bg-(--color-secondary) -translate-y-0.5"
              aria-label="Close menu"
            >
              <i class="bi bi-x-lg text-xl"></i>
            </DrawerClose>
          </div>

          <div class="flex-1 overflow-y-auto px-3 py-4">
            <ul class="m-0 list-none p-0">
              <template v-for="item in navItems" :key="item.name">
                <li class="mb-3">
                  <RouterLink
                    v-if="item.url"
                    :to="item.url"
                    @click="isDrawerOpen = false"
                    class="flex items-center rounded-xl px-4 text-[1.4rem] font-bold uppercase text-(--color-text)!"
                  >
                    {{ item.name }}
                  </RouterLink>

                  <div v-else>
                    <div class="px-4 pb-2 text-[1.4rem] font-bold uppercase tracking-wide text-(--color-text-muted)">
                      {{ item.name }}
                    </div>
                    <ul class="m-0 list-none pl-2">
                      <li v-for="child in item.children" :key="child.url" class="mb-1">
                        <RouterLink
                          :to="child.url"
                          @click="isDrawerOpen = false"
                          class="flex items-center rounded-lg pl-4 py-1 text-[1.3rem] font-bold uppercase text-(--color-text)!"
                        >
                          <Badge v-if="child.icon_url" :src="child.icon_url" class="mr-2 translate-y-0.5" />
                          {{ child.name }}
                        </RouterLink>
                      </li>
                    </ul>
                  </div>
                </li>
              </template>
            </ul>
          </div>

          <div class="bg-(--color-secondary) px-4 py-4">
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
                    @click="isDrawerOpen = false"
                    class="text-sm uppercase text-(--color-text-muted) hover:text-(--color-active)"
                  >
                    Profile
                  </RouterLink>
                  <RouterLink
                    to="/my-submissions/maps"
                    @click="isDrawerOpen = false"
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

            <DiscordLoginButton v-else @success="isDrawerOpen = false" class="w-full" />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  </div>
</template>
