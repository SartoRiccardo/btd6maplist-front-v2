<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useUser } from '@/services/api/users/queries';
import { DEFAULT_AVATAR_URL } from '@/constants/user';

const props = withDefaults(
  defineProps<{
    id: string;
    label?: string;
    centered?: boolean;
    inline?: boolean;
  }>(),
  {
    centered: false,
    inline: false,
  }
);

const { data: user, isLoading } = useUser(props.id, { include: ['flair'] });

const avatarUrl = computed(
  () => user.value?.avatar_url ?? DEFAULT_AVATAR_URL
);

const displayName = computed(() => user.value?.name ?? '...');
</script>

<template>
  <div>
    <RouterLink
      v-if="user?.discord_id"
      :to="`/users/${user.discord_id}`"
      class="no-underline! inline-block hover:[&_.user-name]:text-(--color-active)"
    >
      <div
        class="flex items-stretch text-(--color-text) relative w-fit"
        :class="{ 'my-1.5': !inline }"
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
          class="pl-2"
          :class="{ 'flex flex-col justify-center': centered }"
        >
          <p class="user-name text-start font-bold mb-0 transition-colors duration-100">
            <span v-if="inline" class="ml-[1.8em]" />
            {{ displayName }}
          </p>
          <p v-if="label" class="text-start mb-0 text-xs">{{ label }}</p>
        </div>
      </div>
    </RouterLink>

    <!-- Loading / no link fallback -->
    <div
      v-else
      class="flex items-stretch text-(--color-text) relative w-fit"
      :class="{ 'my-1.5': !inline }"
    >
      <img
        class="border-2 border-white rounded-sm"
        :class="inline
          ? 'w-[1.8em] h-[1.8em] absolute left-0 top-1/2 -translate-y-1/2'
          : 'w-[45px] h-[45px]'"
        :src="avatarUrl"
        alt=""
      />

      <div
        v-if="!isLoading"
        class="pl-2"
        :class="{ 'flex flex-col justify-center': centered }"
      >
        <p class="user-name text-start font-bold mb-0">
          <span v-if="inline" class="ml-[1.8em]" />
          {{ displayName }}
        </p>
        <p v-if="label" class="text-start mb-0 text-xs">{{ label }}</p>
      </div>
    </div>
  </div>
</template>
