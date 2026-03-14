<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import type { User } from '@/services/api/users/types';
import { DEFAULT_AVATAR_URL } from '@/constants/user';

const props = withDefaults(
  defineProps<{
    user: User;
    label?: string;
    centered?: boolean;
    inline?: boolean;
    textSize?: 'sm' | 'lg';
  }>(),
  {
    centered: false,
    inline: false,
  }
);

const avatarUrl = computed(
  () => props.user.avatar_url ?? DEFAULT_AVATAR_URL
);

const textSizeClass = computed(() => {
  if (props.textSize === 'lg') return 'lg:text-xl';
  if (props.textSize === 'sm') return 'lg:text-sm';
  return '';
});
</script>

<template>
  <div>
    <RouterLink
      :to="`/users/${user.discord_id}`"
      class="no-underline! hover:[&_.user-name]:text-(--color-active)"
      :class="{ 'inline-block': inline, 'block': !inline }"
    >
      <div
        class="flex items-stretch text-(--color-text) relative"
        :class="{ 'my-1.5': !inline, 'w-fit': inline }"
      >
        <img
          loading="lazy"
          class="border-2 border-white rounded-sm"
          :class="inline
            ? 'w-[1.8em] h-[1.8em] absolute left-0 top-1/2 -translate-y-1/2'
            : 'w-[45px] h-[45px]'"
          :src="avatarUrl"
          alt=""
        />

        <div
          class="pl-2 min-w-0"
          :class="{ 'flex flex-col justify-center': centered }"
        >
          <p
            class="user-name text-start font-bold mb-0 transition-colors duration-100 truncate"
            :class="textSizeClass"
          >
            <span v-if="inline" class="ml-[1.8em]" />
            {{ user.name }}
          </p>
          <p v-if="label" class="text-start mb-0 text-xs">{{ label }}</p>
        </div>
      </div>
    </RouterLink>
  </div>
</template>
