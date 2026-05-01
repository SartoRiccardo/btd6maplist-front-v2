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
  isGranting: (role: PlatformRole) => boolean;
  onRoleGrant: (role: PlatformRole) => void;
}

const ROLE_ACTIONS_KEY = Symbol("roleActions");

function makeTwoSetMachine(onFetchDone: MaybeRefOrGetter<boolean>) {
  const inFlight = ref(new Set<number>());
  const justSettled = ref(new Set<number>());

  watch(
    () => toValue(onFetchDone),
    (fetching) => {
      if (!fetching) justSettled.value = new Set();
    },
  );

  return {
    isPending: (id: number) =>
      inFlight.value.has(id) || justSettled.value.has(id),
    start: (id: number) => {
      inFlight.value = new Set(inFlight.value).add(id);
    },
    succeed: (id: number) => {
      const next = new Set(inFlight.value);
      next.delete(id);
      inFlight.value = next;
      justSettled.value = new Set(justSettled.value).add(id);
    },
    fail: (id: number) => {
      const next = new Set(inFlight.value);
      next.delete(id);
      inFlight.value = next;
    },
  };
}

export function provideRoleActions(
  userId: MaybeRefOrGetter<string>,
  isFetching: MaybeRefOrGetter<boolean> = false,
) {
  const auth = useAuthStore();
  const { data: allRoles } = usePlatformRoles();
  const mutation = useSetUserRole();
  const revoke = makeTwoSetMachine(isFetching);
  const grant = makeTwoSetMachine(isFetching);

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

  function mutateRole(
    role: PlatformRole,
    grantFlag: boolean,
    machine: ReturnType<typeof makeTwoSetMachine>,
  ) {
    machine.start(role.id);
    mutation.mutate(
      { userId: toValue(userId), roleId: role.id, grant: grantFlag },
      {
        onSuccess: () => machine.succeed(role.id),
        onError: () => machine.fail(role.id),
      },
    );
  }

  const context: RoleActionsContext = {
    isRevocable: (role) => grantableIds.value.has(role.id),
    isRevoking: (role) => revoke.isPending(role.id),
    onRoleRevoke: (role) => mutateRole(role, false, revoke),
    isGranting: (role) => grant.isPending(role.id),
    onRoleGrant: (role) => mutateRole(role, true, grant),
  };

  provide(ROLE_ACTIONS_KEY, context);
}

export function useRoleActions(): RoleActionsContext | null {
  return inject(ROLE_ACTIONS_KEY, null);
}
