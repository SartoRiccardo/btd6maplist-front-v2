<script setup lang="ts">
import { computed } from 'vue';
import type { User } from '@/services/api/users/types';
import { useAuthStore } from '@/stores/auth';
import { usePlatformRoles } from '@/services/api/platform-roles/queries';
import { intToHex } from '@/utils/colors';
import Tooltip from '@/components/ui/Tooltip.vue';

const props = defineProps<{ user: User }>();

const auth = useAuthStore();
const { data: allRoles } = usePlatformRoles();

const grantableIds = computed(() => {
  const myRoles = auth.user?.roles;
  if (!myRoles || !allRoles.value) return new Set<number>();
  const ids = new Set<number>();
  for (const myRole of myRoles) {
    const full = allRoles.value.find((r) => r.id === myRole.id);
    if (full) {
      for (const id of full.can_grant) ids.add(id);
    }
  }
  return ids;
});

const visiblePlatformRoles = computed(() =>
  (props.user.roles ?? []).filter((r) =>
    !r.internal || grantableIds.value.has(r.id)
  )
);

const hasRoles = computed(() =>
  (props.user.achievement_roles?.length ?? 0) > 0 || visiblePlatformRoles.value.length > 0
);
</script>

<template>
  <div v-if="hasRoles" class="flex gap-2 flex-wrap">
    <Tooltip
      v-for="role in user.achievement_roles"
      :key="`achievement-${role.id}`"
      :text="role.tooltip_description"
    >
      <div
        class="px-2 py-0.5 rounded-[0.3rem] border-2 border-solid font-border text-sm"
        :style="{ backgroundColor: intToHex(role.clr_inner), borderColor: intToHex(role.clr_border) }"
      >
        {{ role.name }}
      </div>
    </Tooltip>

    <div
      v-for="role in visiblePlatformRoles"
      :key="`platform-${role.id}`"
      class="px-2 py-0.5 rounded-[0.3rem] border-2 border-black/40 font-border text-sm bg-black/30"
    >
      {{ role.name }}
    </div>
  </div>
</template>
