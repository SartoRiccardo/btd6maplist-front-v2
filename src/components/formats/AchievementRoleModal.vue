<script setup lang="ts">
import { ref, watch } from "vue";
import type {
  AchievementRole,
  UpsertAchievementRoleRequest,
} from "@/services/api/achievement-roles/types";
import type { FormFieldError } from "@/services/api/formErrors";
import { parseApiErrors } from "@/services/api/formErrors";
import { ApiError } from "@/services/api/client";
import { intToHex, hexToInt } from "@/utils/colors";
import Button from "@/components/ui/Button.vue";
import AchievementRoleForm, {
  type AchievementRoleFormModel,
} from "./AchievementRoleForm.vue";

const props = defineProps<{ formatId: number }>();

const open = ref(false);
const isEdit = ref(false);
const saving = ref(false);
const resolvePromise = ref<((value: boolean) => void) | null>(null);
const submitFn = ref<
  ((data: UpsertAchievementRoleRequest) => Promise<unknown>) | null
>(null);

const formRef = ref<InstanceType<typeof AchievementRoleForm> | null>(null);
const formModel = ref<AchievementRoleFormModel>(emptyModel());
const apiErrors = ref<FormFieldError[]>([]);
const activeErrors = ref<FormFieldError[]>([]);

function emptyModel(defaultLbType = ""): AchievementRoleFormModel {
  return {
    lb_type: defaultLbType,
    threshold: "0",
    for_first: false,
    name: "",
    clr_border: "#ffffff",
    clr_inner: "#000000",
    tooltip_description: "",
    discord_roles: [],
  };
}

function fromRole(role: AchievementRole): AchievementRoleFormModel {
  return {
    lb_type: role.lb_type,
    threshold: String(role.threshold),
    for_first: role.for_first,
    name: role.name,
    clr_border: intToHex(role.clr_border),
    clr_inner: intToHex(role.clr_inner),
    tooltip_description: role.tooltip_description ?? "",
    discord_roles: role.discord_roles.map((r) => ({ ...r })),
  };
}

function toRequest(): UpsertAchievementRoleRequest {
  const f = formModel.value;
  return {
    lb_format: props.formatId,
    lb_type: f.lb_type,
    threshold: f.for_first ? 0 : parseInt(f.threshold) || 0,
    for_first: f.for_first,
    name: f.name.trim(),
    clr_border: hexToInt(f.clr_border),
    clr_inner: hexToInt(f.clr_inner),
    tooltip_description: f.tooltip_description.trim() || null,
    discord_roles: f.discord_roles.filter((r) => r.guild_id || r.role_id),
  };
}

function openModal(
  submit: (data: UpsertAchievementRoleRequest) => Promise<unknown>,
  role?: AchievementRole,
  defaultLbType = "",
): Promise<boolean> {
  isEdit.value = !!role;
  formModel.value = role ? fromRole(role) : emptyModel(defaultLbType);
  apiErrors.value = [];
  submitFn.value = submit;
  open.value = true;
  return new Promise((resolve) => {
    resolvePromise.value = resolve;
  });
}

function close(success: boolean) {
  open.value = false;
  resolvePromise.value?.(success);
  resolvePromise.value = null;
  submitFn.value = null;
}

async function handleSave() {
  if (!formRef.value || !submitFn.value) return;
  await formRef.value.touchAll();
  if (activeErrors.value.length > 0) return;

  saving.value = true;
  try {
    await submitFn.value(toRequest());
    close(true);
  } catch (e) {
    if (e instanceof ApiError) {
      apiErrors.value = parseApiErrors(e);
      await formRef.value.clearTouched();
    }
  } finally {
    saving.value = false;
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape" && !saving.value) close(false);
}

watch(open, (isOpen) => {
  if (isOpen) document.addEventListener("keydown", onKeydown);
  else document.removeEventListener("keydown", onKeydown);
});

defineExpose({ openModal });
</script>

<template>
  <Teleport to="body">
    <Transition name="achievement-role-modal">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center"
        @click="!saving && close(false)"
      >
        <div class="absolute inset-0 bg-black/80" />
        <div
          class="relative bg-(--color-secondary) rounded-(--radius-panel) p-6 w-[90%] max-w-xl max-h-[90vh] flex flex-col overflow-hidden"
          @click.stop
        >
          <h2 class="font-['Luckiest_Guy'] text-xl mb-4">
            {{ isEdit ? "Edit Achievement Role" : "Add Achievement Role" }}
          </h2>

          <div class="overflow-y-auto flex-1 pr-1">
            <AchievementRoleForm
              ref="formRef"
              v-model="formModel"
              :disabled="saving"
              :external-errors="apiErrors"
              @errors="activeErrors = $event"
            />
          </div>

          <div class="flex justify-end gap-3 mt-4">
            <Button :disabled="saving" @click="close(false)">Cancel</Button>
            <Button active :disabled="saving" @click="handleSave">
              {{ saving ? "Saving..." : "Save" }}
            </Button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.achievement-role-modal-enter-active,
.achievement-role-modal-leave-active {
  transition: opacity 0.2s ease;
}
.achievement-role-modal-enter-from,
.achievement-role-modal-leave-to {
  opacity: 0;
}
</style>
