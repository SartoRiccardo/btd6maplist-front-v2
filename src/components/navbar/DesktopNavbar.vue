<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import Badge from "@/components/common/Badge.vue";
import DiscordLoginButton from "./DiscordLoginButton.vue";
import { useAuthStore } from "@/stores/auth";
import { useThemeStore } from "@/stores/theme";
import { useLocaleStore } from "@/stores/locale";
import { LOCALES } from "@/i18n";
import { DEFAULT_AVATAR_URL } from "@/constants/user";
import { themes } from "@/constants/themes";
import type { NavItem } from "./types";

interface Props {
  navItems: NavItem[];
}

defineProps<Props>();

const { t } = useI18n({ inheritLocale: true });

const authStore = useAuthStore();
const themeStore = useThemeStore();
const localeStore = useLocaleStore();

function handleLogout() {
  authStore.logout();
}
</script>

<template>
  <div class="justify-end flex gap-x-3">
    <!-- Search Button -->
    <RouterLink
      to="/search"
      class="flex items-center no-underline text-(--color-text)! transition-colors duration-200 ease rounded-xl px-4 py-2 hover:cursor-pointer hover:bg-(--color-secondary) hover:text-inherit!"
      :aria-label="t('search')"
    >
      <i class="bi bi-search"></i>
    </RouterLink>

    <template v-for="item in navItems" :key="item.name">
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
        <div
          class="absolute right-0 top-full max-w-min min-w-70 pointer-events-none opacity-0 -translate-y-4 transition-all duration-200 ease pt-3 group-hover:pointer-events-auto group-hover:opacity-100 group-hover:translate-y-0 dropdown"
        >
          <ul
            class="mt-2 mb-0 bg-(--color-secondary) px-4 py-2 rounded-lg list-none"
          >
            <li
              v-for="child in item.children"
              :key="child.url"
              class="py-[0.1rem]"
            >
              <RouterLink
                :to="child.url"
                class="no-underline text-(--color-text)! inline-block w-full hover:text-(--color-active)!"
              >
                <Badge
                  v-if="child.icon_url"
                  :src="child.icon_url"
                  class="mr-0.5"
                />
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
          type="button"
          class="w-12 h-12 overflow-hidden border-2 rounded-md border-[#E0E3FF] transition-colors cursor-pointer ml-2"
          :aria-label="t('loggedInAs', { name: authStore.user.name })"
        >
          <img
            :src="authStore.user.avatar_url || DEFAULT_AVATAR_URL"
            :alt="authStore.user.name"
            class="w-full h-full object-cover"
          />
        </button>

        <!-- Dropdown menu -->
        <div
          class="absolute right-0 top-full max-w-min min-w-70 pointer-events-none opacity-0 -translate-y-4 transition-all duration-200 ease pt-3 group-hover:pointer-events-auto group-hover:opacity-100 group-hover:translate-y-0 dropdown cursor-default"
        >
          <ul
            class="mt-2 mb-0 bg-(--color-secondary) px-4 py-2 rounded-lg list-none"
          >
            <li class="py-[0.1rem]">
              <RouterLink
                :to="`/users/${authStore.user.discord_id}`"
                class="no-underline text-(--color-text)! inline-block w-full hover:text-(--color-active)!"
              >
                {{ t("profile") }}
              </RouterLink>
            </li>
            <li class="py-[0.1rem]">
              <RouterLink
                to="/my-submissions/maps"
                class="no-underline text-(--color-text)! inline-block w-full hover:text-(--color-active)!"
              >
                {{ t("mySubmissions") }}
              </RouterLink>
            </li>
            <li class="py-[0.1rem] relative theme-trigger">
              <span
                class="no-underline text-(--color-text)! inline-block w-full hover:text-(--color-active)! cursor-pointer select-none"
              >
                {{ t("theme") }}
              </span>

              <!-- Theme sub-panel -->
              <div
                class="absolute right-full top-0 mr-2 pointer-events-none opacity-0 translate-x-2 transition-all duration-200 ease theme-panel"
              >
                <ul
                  class="bg-(--color-secondary) px-2 py-1 rounded-lg list-none min-w-44 text-[1.5rem]"
                >
                  <li v-for="theme in themes" :key="theme.id">
                    <button
                      type="button"
                      @click="themeStore.setTheme(theme.id)"
                      class="flex items-center gap-2 w-full text-left bg-transparent border-none text-(--color-text) hover:text-(--color-active) cursor-pointer px-1 py-0.5 rounded"
                    >
                      <span
                        class="w-4 h-4 rounded-full shrink-0 border border-(--color-contrast) translate-y-[0.1rem]"
                        :style="{
                          background: `linear-gradient(135deg, ${theme.colors.primary} 50%, ${theme.colors.highlight} 50%)`,
                        }"
                      />
                      <span class="whitespace-nowrap uppercase">{{
                        theme.name
                      }}</span>
                    </button>
                  </li>
                </ul>
              </div>
            </li>
            <li class="py-[0.1rem] relative locale-trigger">
              <span
                class="no-underline text-(--color-text)! inline-block w-full hover:text-(--color-active)! cursor-pointer select-none"
              >
                {{ t("language") }}
              </span>

              <!-- Language sub-panel -->
              <div
                class="absolute right-full top-0 mr-2 pointer-events-none opacity-0 translate-x-2 transition-all duration-200 ease locale-panel"
              >
                <ul
                  class="bg-(--color-secondary) px-2 py-1 rounded-lg list-none min-w-44 text-[1.5rem]"
                >
                  <li v-for="locale in LOCALES" :key="locale.id">
                    <button
                      type="button"
                      @click="localeStore.setLocale(locale.id)"
                      class="flex items-center gap-2 w-full text-left bg-transparent border-none text-(--color-text) hover:text-(--color-active) cursor-pointer px-1 py-0.5 rounded"
                    >
                      <i
                        v-if="localeStore.localeId === locale.id"
                        class="bi bi-check-lg shrink-0"
                      />
                      <span v-else class="w-4 shrink-0" />
                      <span class="whitespace-nowrap">{{
                        locale.name
                      }}</span>
                    </button>
                  </li>
                </ul>
              </div>
            </li>
            <li class="py-[0.1rem]">
              <hr class="border-(--color-contrast) my-1 opacity-50" />
            </li>
            <li class="py-[0.1rem] flex items-center justify-between gap-4">
              <span
                class="text-(--color-text-muted) truncate max-w-50 normal-case"
                >{{ authStore.user.name }}</span
              >
              <button
                type="button"
                @click="handleLogout"
                class="bg-(--color-danger) brightness-100 hover:brightness-110 saturate-100 hover:saturate-125 text-white px-3 py-2 rounded-lg text-sm cursor-pointer"
                :aria-label="t('logout')"
              >
                <i class="bi bi-box-arrow-right"></i>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </template>

    <!-- Discord Login Button (not authenticated) -->
    <DiscordLoginButton v-else />
  </div>
</template>

<style scoped>
.theme-trigger:hover .theme-panel,
.locale-trigger:hover .locale-panel {
  pointer-events: auto;
  opacity: 1;
  transform: translateX(0);
}
</style>

<i18n lang="json">
{
  "en": {
    "search": "Search",
    "loggedInAs": "Logged in as {name}",
    "profile": "Profile",
    "mySubmissions": "My Submissions",
    "theme": "Theme",
    "language": "Language",
    "logout": "Logout"
  }
}
</i18n>
