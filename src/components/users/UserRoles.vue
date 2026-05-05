<script setup lang="ts">
import { computed, ref } from "vue";
import type { User } from "@/services/api/users/types";
import { useAuthStore } from "@/stores/auth";
import { usePlatformRoles } from "@/services/api/platform-roles/queries";
import { useRoleActions } from "@/composables/useRoleActions";
import { onClickOutside } from "@vueuse/core";
import { intToHex } from "@/utils/colors";
import Tooltip from "@/components/ui/Tooltip.vue";

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
  (props.user.roles ?? []).filter(
    (r) => !r.internal || grantableIds.value.has(r.id),
  ),
);

const assignableRoles = computed(() => {
  if (!allRoles.value) return [];
  const userRoleIds = new Set((props.user.roles ?? []).map((r) => r.id));
  return allRoles.value.filter(
    (r) => grantableIds.value.has(r.id) && !userRoleIds.has(r.id),
  );
});

const roleActions = useRoleActions();

const hasRoles = computed(
  () =>
    (props.user.achievement_roles?.length ?? 0) > 0 ||
    visiblePlatformRoles.value.length > 0,
);

const showDropdown = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);
onClickOutside(dropdownRef, () => (showDropdown.value = false));
</script>

<template>
  <div
    v-if="hasRoles || assignableRoles.length > 0"
    class="flex gap-2 flex-wrap"
  >
    <Tooltip
      v-for="role in user.achievement_roles"
      :key="`achievement-${role.id}`"
      :text="role.tooltip_description ?? ''"
    >
      <div
        class="px-2 py-0.5 rounded-[0.3rem] border-2 border-solid font-border text-sm"
        :style="{
          backgroundColor: intToHex(role.clr_inner),
          borderColor: intToHex(role.clr_border),
        }"
      >
        {{ role.name }}
      </div>
    </Tooltip>

    <div
      v-for="role in visiblePlatformRoles"
      :key="`platform-${role.id}`"
      :class="[
        roleActions?.isRevocable(role) ? 'pl-1' : 'pl-2',
        roleActions?.isRevoking(role) ? 'opacity-50' : '',
      ]"
      class="flex items-center gap-1 pr-2 py-0.5 rounded-[0.3rem] border-2 border-black/40 font-border text-sm bg-black/30"
    >
      <button
        type="button"
        v-if="roleActions?.isRevocable(role)"
        @click="roleActions.onRoleRevoke(role)"
        :disabled="roleActions.isRevoking(role)"
        class="leading-none hover:text-(--color-danger) transition-colors cursor-pointer font-border disabled:cursor-not-allowed"
      >
        <i class="bi bi-x" />
      </button>
      {{ role.name }}
    </div>

    <div
      v-if="assignableRoles.length > 0 && !user.is_banned"
      ref="dropdownRef"
      class="relative"
    >
      <button
        type="button"
        @click="showDropdown = !showDropdown"
        class="px-2 py-0.5 h-[98%] rounded-[0.3rem] border-2 border-black/40 font-border text-sm bg-black/30 cursor-pointer leading-none"
      >
        <i class="bi bi-plus" />
      </button>
      <div
        v-if="showDropdown"
        class="absolute top-full left-0 mt-1 z-20 flex flex-col bg-(--color-secondary) border border-black/40 rounded-[0.3rem] overflow-hidden min-w-max"
      >
        <button
          type="button"
          v-for="role in assignableRoles"
          :key="role.id"
          @click="roleActions?.onRoleGrant(role)"
          :disabled="roleActions?.isGranting(role)"
          :class="roleActions?.isGranting(role) ? 'opacity-50' : ''"
          class="px-3 py-1 text-sm font-border text-left hover:bg-(--color-contrast) transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          {{ role.name }}
        </button>
      </div>
    </div>
  </div>
</template>
