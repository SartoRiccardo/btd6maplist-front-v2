<script setup lang="ts">
import type { User } from '@/services/api/users/types';
import { DEFAULT_AVATAR_URL, DEFAULT_BANNER_URL } from '@/constants/user';
import { intToHex } from '@/utils/colors';
import Tooltip from '@/components/ui/Tooltip.vue';

defineProps<{ user: User }>();

const medalTypes = [
  { key: 'wins' as const, image: '/images/medals/medal_win.webp', tooltip: 'CHIMPS Completions' },
  { key: 'black_border' as const, image: '/images/medals/medal_bb.webp', tooltip: 'CHIMPS Completions (Black Border)' },
  { key: 'no_geraldo' as const, image: '/images/medals/medal_nogerry.webp', tooltip: 'No Optimal Hero' },
  { key: 'current_lcc' as const, image: '/images/medals/medal_lcc.webp', tooltip: 'Least Cash CHIMPS' },
];
</script>

<template>
  <div class="bg-(--color-secondary) rounded-(--radius-panel) p-[5px]">
    <!-- Banner -->
    <div
      class="flex py-3 bg-cover bg-center rounded-[0.5rem] px-2"
      :style="{ backgroundImage: `url(${user.banner_url || DEFAULT_BANNER_URL})` }"
    >
      <!-- Avatar -->
      <img
        :src="user.avatar_url || DEFAULT_AVATAR_URL"
        alt=""
        class="w-24 h-24 border-2 border-white rounded-[0.7rem] shrink-0 object-cover"
      />

      <!-- Name & Roles -->
      <div class="pl-3 pt-3.5 flex flex-col">
        <h1 class="font-['Luckiest_Guy'] text-3xl font-border mb-2">
          {{ user.name }}
        </h1>

        <div v-if="user.achievement_roles?.length" class="flex gap-2 flex-wrap">
          <Tooltip
            v-for="role in user.achievement_roles"
            :key="role.id"
            :text="role.tooltip_description"
          >
            <div
              class="px-2 py-0.5 rounded-[0.3rem] border-2 border-solid font-border text-sm"
              :style="{ backgroundColor: intToHex(role.clr_inner), borderColor: intToHex(role.clr_border) }"
            >
              {{ role.name }}
            </div>
          </Tooltip>
        </div>
      </div>
    </div>

    <!-- Medals -->
    <div
      v-if="user.medals && medalTypes.some((m) => (user.medals?.[m.key] ?? 0) > 0)"
      class="flex justify-center gap-3 pt-2"
    >
      <template v-for="medal in medalTypes" :key="medal.key">
        <Tooltip v-if="(user.medals?.[medal.key] ?? 0) > 0" :text="medal.tooltip">
          <div class="relative">
            <img :src="medal.image" alt="" class="w-[60px] h-[60px]" />
            <p class="absolute bottom-[-0.5rem] right-[-0.2rem] mb-0 font-['Luckiest_Guy'] font-border text-xl">
              {{ user.medals![medal.key] }}
            </p>
          </div>
        </Tooltip>
      </template>
    </div>
  </div>
</template>
