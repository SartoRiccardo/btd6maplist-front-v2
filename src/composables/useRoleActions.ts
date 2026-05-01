import {
  computed,
  provide,
  inject,
  toValue,
  ref,
  watch,
  type MaybeRefOrGetter,
} from "vue";
import type { PlatformRole } from "@/services/api/platform-roles/types";
import { usePlatformRoles } from "@/services/api/platform-roles/queries";
import { useSetUserRole } from "@/services/api/users/queries";
import { useAuthStore } from "@/stores/auth";

interface RoleActionsContext {
  isRevocable: (role: PlatformRole) => boolean;
  isRevoking: (role: PlatformRole) => boolean;
  onRoleRevoke: (role: PlatformRole) => void;
}

const ROLE_ACTIONS_KEY = Symbol("roleActions");

export function provideRoleActions(
  userId: MaybeRefOrGetter<string>,
  isFetching: MaybeRefOrGetter<boolean> = false,
) {
  const auth = useAuthStore();
  const { data: allRoles } = usePlatformRoles();
  const mutation = useSetUserRole();
  const isDeleting = ref(new Set<number>());
  const justDeleted = ref(new Set<number>());

  watch(
    () => toValue(isFetching),
    (fetching) => {
      if (!fetching) justDeleted.value = new Set();
    },
  );

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

  const context: RoleActionsContext = {
    isRevocable: (role) => grantableIds.value.has(role.id),
    isRevoking: (role) =>
      isDeleting.value.has(role.id) || justDeleted.value.has(role.id),
    onRoleRevoke: (role) => {
      isDeleting.value = new Set(isDeleting.value).add(role.id);
      mutation.mutate(
        { userId: toValue(userId), roleId: role.id, grant: false },
        {
          onSuccess: () => {
            const next = new Set(isDeleting.value);
            next.delete(role.id);
            isDeleting.value = next;
            justDeleted.value = new Set(justDeleted.value).add(role.id);
          },
          onError: () => {
            const next = new Set(isDeleting.value);
            next.delete(role.id);
            isDeleting.value = next;
          },
        },
      );
    },
  };

  provide(ROLE_ACTIONS_KEY, context);
}

export function useRoleActions(): RoleActionsContext | null {
  return inject(ROLE_ACTIONS_KEY, null);
}
