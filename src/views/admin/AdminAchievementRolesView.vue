<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useFormat } from "@/services/api/formats/queries";
import {
  useAchievementRoles,
  useCreateAchievementRole,
  useUpdateAchievementRole,
  useDeleteAchievementRole,
} from "@/services/api/achievement-roles/queries";
import type { AchievementRole } from "@/services/api/achievement-roles/types";
import { permissions } from "@/constants/permissions";
import { LEADERBOARD_VALUES } from "@/constants/formats";
import { intToHex } from "@/utils/colors";
import { ApiError } from "@/services/api/client";
import { toast } from "vue-sonner";
import Button from "@/components/ui/Button.vue";
import ConfirmModal from "@/components/common/ConfirmModal.vue";
import AchievementRoleModal from "@/components/formats/AchievementRoleModal.vue";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const id = Number(route.params["id"]);
const canEdit = computed(() =>
  auth.hasPermission(permissions.achievementRoles.edit, id),
);

const { data: format } = useFormat(id);
const { data: rolesData, isLoading } = useAchievementRoles(id);

const { mutateAsync: createRole } = useCreateAchievementRole();
const { mutateAsync: updateRole } = useUpdateAchievementRole();
const { mutateAsync: deleteRole } = useDeleteAchievementRole();

const KNOWN_LB_TYPES = LEADERBOARD_VALUES.map((lv) => lv.key);

const groups = computed(() => {
  const roles = rolesData.value?.data ?? [];

  const sortRoles = (list: AchievementRole[]) =>
    [...list].sort((a, b) => {
      if (a.for_first !== b.for_first) return a.for_first ? -1 : 1;
      return a.threshold - b.threshold;
    });

  const known = LEADERBOARD_VALUES.map((lv) => ({
    key: lv.key,
    label: lv.label,
    roles: sortRoles(roles.filter((r) => r.lb_type === lv.key)),
  }));

  const unknownTypes = [
    ...new Set(
      roles
        .filter((r) => !KNOWN_LB_TYPES.includes(r.lb_type))
        .map((r) => r.lb_type),
    ),
  ];
  const unknown = unknownTypes.map((type) => ({
    key: type,
    label: type,
    roles: sortRoles(roles.filter((r) => r.lb_type === type)),
  }));

  return [...known, ...unknown];
});

const modalRef = ref<InstanceType<typeof AchievementRoleModal> | null>(null);
const confirmRef = ref<InstanceType<typeof ConfirmModal> | null>(null);
const isBusy = ref(false);

async function handleAdd(lbType: string) {
  const request = await modalRef.value?.openModal(undefined, lbType);
  if (!request) return;
  isBusy.value = true;
  try {
    await createRole(request);
    toast.success("Role created.");
  } catch (e) {
    toast.error(
      e instanceof ApiError
        ? "Failed to create role."
        : "Something went wrong.",
    );
  } finally {
    isBusy.value = false;
  }
}

async function handleEdit(role: AchievementRole) {
  const request = await modalRef.value?.openModal(role);
  if (!request) return;
  isBusy.value = true;
  try {
    await updateRole({ id: role.id, data: request });
    toast.success("Role updated.");
  } catch (e) {
    toast.error(
      e instanceof ApiError
        ? "Failed to update role."
        : "Something went wrong.",
    );
  } finally {
    isBusy.value = false;
  }
}

async function handleDelete(role: AchievementRole) {
  const confirmed = await confirmRef.value?.confirm();
  if (!confirmed) return;
  isBusy.value = true;
  try {
    await deleteRole({ id: role.id, formatId: id });
    toast.success("Role deleted.");
  } catch {
    toast.error("Failed to delete role.");
  } finally {
    isBusy.value = false;
  }
}
</script>

<template>
  <div>
    <h1
      class="font-['Luckiest_Guy'] text-3xl md:text-4xl text-center mt-6 mb-4"
    >
      {{ format ? format.name : "Achievement Roles" }}
    </h1>

    <div v-if="isLoading" class="flex justify-center py-12">
      <p class="text-(--color-text-muted)">Loading...</p>
    </div>

    <div v-else-if="!canEdit" class="flex justify-center py-12">
      <p class="text-(--color-text-muted)">
        You don't have permission to edit achievement roles.
      </p>
    </div>

    <template v-else>
      <div
        v-for="(group, gi) in groups"
        :key="group.key"
        :class="gi > 0 ? 'pt-10' : ''"
      >
        <div class="flex items-center justify-between mb-2">
          <h2 class="font-['Luckiest_Guy'] text-2xl">{{ group.label }}</h2>
          <Button :disabled="isBusy" @click="handleAdd(group.key)">
            <i class="bi bi-plus-lg" /> Add
          </Button>
        </div>
        <hr class="border-(--color-contrast) mb-4" />

        <p
          v-if="group.roles.length === 0"
          class="text-(--color-text-muted) text-sm mb-2"
        >
          No roles yet.
        </p>

        <div v-else class="flex flex-col gap-2 mb-2">
          <div
            v-for="role in group.roles"
            :key="role.id"
            class="flex items-center gap-3 bg-(--color-primary) rounded-(--radius-btn) px-3 py-2"
          >
            <!-- Badge preview -->
            <div
              class="px-2 py-0.5 rounded-[0.3rem] border-2 border-solid font-border text-sm whitespace-nowrap shrink-0"
              :style="{
                backgroundColor: intToHex(role.clr_inner),
                borderColor: intToHex(role.clr_border),
              }"
            >
              {{ role.name }}
            </div>

            <!-- Details -->
            <div class="flex-1 min-w-0">
              <p class="text-sm">
                <span v-if="role.for_first" class="text-(--color-text-muted)"
                  >1st place</span
                >
                <span v-else class="text-(--color-text-muted)"
                  >Threshold: {{ role.threshold }}</span
                >
                <span
                  v-if="role.discord_roles.length"
                  class="ml-2 text-xs text-(--color-text-muted)"
                >
                  · {{ role.discord_roles.length }} Discord role{{
                    role.discord_roles.length !== 1 ? "s" : ""
                  }}
                </span>
              </p>
              <p
                v-if="role.tooltip_description"
                class="text-xs text-(--color-text-muted) truncate"
              >
                {{ role.tooltip_description }}
              </p>
            </div>

            <!-- Actions -->
            <div class="flex gap-2 shrink-0">
              <Button :disabled="isBusy" @click="handleEdit(role)">
                <i class="bi bi-pencil" />
              </Button>
              <Button :disabled="isBusy" danger @click="handleDelete(role)">
                <i class="bi bi-trash" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div class="flex justify-between items-center mt-6">
      <Button @click="router.push('/admin/lists')">← Back</Button>
    </div>

    <AchievementRoleModal ref="modalRef" :format-id="id" />

    <ConfirmModal ref="confirmRef">
      <p class="text-center">Delete this achievement role?</p>
    </ConfirmModal>
  </div>
</template>
