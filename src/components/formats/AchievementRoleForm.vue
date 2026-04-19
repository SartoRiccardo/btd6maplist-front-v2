<script setup lang="ts">
import { computed } from "vue";
import { useTouchedProvider } from "@/composables/useTouchedFields";
import { useEmitOnChange } from "@/composables/useEmitOnChange";
import type { FormFieldError } from "@/services/api/formErrors";
import { LEADERBOARD_VALUES } from "@/constants/formats";
import BoxedCheckbox from "@/components/ui/BoxedCheckbox.vue";
import Button from "@/components/ui/Button.vue";

export interface AchievementRoleFormModel {
  lb_type: string;
  threshold: string;
  for_first: boolean;
  name: string;
  clr_border: string;
  clr_inner: string;
  tooltip_description: string;
  discord_roles: { guild_id: string; role_id: string }[];
}

const props = withDefaults(
  defineProps<{
    modelValue: AchievementRoleFormModel;
    disabled?: boolean;
    externalErrors?: FormFieldError[];
  }>(),
  { disabled: false, externalErrors: () => [] },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: AchievementRoleFormModel): void;
  (e: "errors", value: FormFieldError[]): void;
}>();

const { touchAll, clearTouched, isTouched, touch } = useTouchedProvider();
defineExpose({ touchAll, clearTouched });

function update(partial: Partial<AchievementRoleFormModel>) {
  for (const key of Object.keys(partial)) touch(key);
  emit("update:modelValue", { ...props.modelValue, ...partial });
}

function addDiscordRole() {
  touch("discord_roles");
  emit("update:modelValue", {
    ...props.modelValue,
    discord_roles: [...props.modelValue.discord_roles, { guild_id: "", role_id: "" }],
  });
}

function removeDiscordRole(index: number) {
  touch("discord_roles");
  emit("update:modelValue", {
    ...props.modelValue,
    discord_roles: props.modelValue.discord_roles.filter((_, i) => i !== index),
  });
}

function updateDiscordRole(index: number, partial: { guild_id?: string; role_id?: string }) {
  touch("discord_roles");
  emit("update:modelValue", {
    ...props.modelValue,
    discord_roles: props.modelValue.discord_roles.map((r, i) => (i === index ? { ...r, ...partial } : r)),
  });
}

const ownErrors = computed<FormFieldError[]>(() => {
  const errors: FormFieldError[] = [];
  if (!props.modelValue.name.trim()) {
    errors.push({ path: "name", message: "Name is required.", source: "validation" });
  } else if (props.modelValue.name.trim().length > 32) {
    errors.push({ path: "name", message: "Max 32 characters.", source: "validation" });
  }
  if (!props.modelValue.lb_type) {
    errors.push({ path: "lb_type", message: "Type is required.", source: "validation" });
  }
  const thresh = parseInt(props.modelValue.threshold);
  if (isNaN(thresh) || thresh < 0) {
    errors.push({ path: "threshold", message: "Must be a non-negative integer.", source: "validation" });
  }
  if (props.modelValue.tooltip_description.trim().length > 128) {
    errors.push({ path: "tooltip_description", message: "Max 128 characters.", source: "validation" });
  }
  return errors;
});

const activeErrors = computed<FormFieldError[]>(() => {
  const validation = ownErrors.value.filter((e) => isTouched(e.path));
  const externalValidation = (props.externalErrors ?? []).filter(
    (e) => e.source === "validation" && isTouched(e.path),
  );
  const externalApi = (props.externalErrors ?? []).filter(
    (e) => e.source === "api" && !isTouched(e.path),
  );
  return [...validation, ...externalValidation, ...externalApi];
});

useEmitOnChange(activeErrors, (errors) => emit("errors", errors));

function fieldError(field: string): string | undefined {
  return activeErrors.value.find((e) => e.path === field)?.message;
}

const inputClass =
  "w-full px-3 py-2 rounded-(--radius-btn) bg-(--color-primary) text-(--color-text) border border-(--color-contrast) focus:outline-none focus:border-(--color-active)";
const errorClass = "border-(--color-danger)!";
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
    <!-- lb_type -->
    <div>
      <label class="block font-bold mb-1 text-sm">Type</label>
      <select
        :value="modelValue.lb_type"
        :disabled="disabled"
        :class="[inputClass, fieldError('lb_type') ? errorClass : '']"
        @change="update({ lb_type: ($event.target as HTMLSelectElement).value })"
      >
        <option value="" disabled>Select...</option>
        <option v-for="lv in LEADERBOARD_VALUES" :key="lv.key" :value="lv.key">
          {{ lv.label }}
        </option>
      </select>
      <p v-if="fieldError('lb_type')" class="text-(--color-danger) text-xs mt-1">
        {{ fieldError("lb_type") }}
      </p>
    </div>

    <!-- threshold -->
    <div>
      <label class="block font-bold mb-1 text-sm">Threshold</label>
      <input
        type="number"
        min="0"
        :value="modelValue.threshold"
        :disabled="disabled"
        :class="[inputClass, fieldError('threshold') ? errorClass : '']"
        @input="update({ threshold: ($event.target as HTMLInputElement).value })"
      />
      <p v-if="fieldError('threshold')" class="text-(--color-danger) text-xs mt-1">
        {{ fieldError("threshold") }}
      </p>
    </div>

    <!-- for_first -->
    <div class="flex flex-col justify-end pb-1">
      <BoxedCheckbox
        :model-value="modelValue.for_first"
        :disabled="disabled"
        label="First place only"
        @update:model-value="update({ for_first: $event })"
      />
    </div>

    <!-- name -->
    <div class="sm:col-span-3">
      <label class="block font-bold mb-1 text-sm">Name</label>
      <input
        type="text"
        maxlength="32"
        :value="modelValue.name"
        :disabled="disabled"
        :class="[inputClass, fieldError('name') ? errorClass : '']"
        @input="update({ name: ($event.target as HTMLInputElement).value })"
      />
      <p v-if="fieldError('name')" class="text-(--color-danger) text-xs mt-1">
        {{ fieldError("name") }}
      </p>
    </div>

    <!-- colors + preview -->
    <div>
      <label class="block font-bold mb-1 text-sm">Border Color</label>
      <input
        type="color"
        :value="modelValue.clr_border"
        :disabled="disabled"
        class="w-full h-10 rounded-(--radius-btn) border border-(--color-contrast) cursor-pointer bg-(--color-primary) p-1"
        @input="update({ clr_border: ($event.target as HTMLInputElement).value })"
      />
    </div>

    <div>
      <label class="block font-bold mb-1 text-sm">Inner Color</label>
      <input
        type="color"
        :value="modelValue.clr_inner"
        :disabled="disabled"
        class="w-full h-10 rounded-(--radius-btn) border border-(--color-contrast) cursor-pointer bg-(--color-primary) p-1"
        @input="update({ clr_inner: ($event.target as HTMLInputElement).value })"
      />
    </div>

    <div class="flex flex-col justify-end pb-1">
      <label class="block font-bold mb-1 text-sm">Preview</label>
      <div
        class="inline-block px-2 py-0.5 rounded-[0.3rem] border-2 border-solid font-border text-sm self-start"
        :style="{
          backgroundColor: modelValue.clr_inner,
          borderColor: modelValue.clr_border,
        }"
      >
        {{ modelValue.name || "Role Name" }}
      </div>
    </div>

    <!-- tooltip_description -->
    <div class="sm:col-span-3">
      <label class="block font-bold mb-1 text-sm">Tooltip Description</label>
      <textarea
        :value="modelValue.tooltip_description"
        :disabled="disabled"
        maxlength="128"
        rows="2"
        :class="[inputClass, 'resize-none', fieldError('tooltip_description') ? errorClass : '']"
        @input="update({ tooltip_description: ($event.target as HTMLTextAreaElement).value })"
      />
      <p v-if="fieldError('tooltip_description')" class="text-(--color-danger) text-xs mt-1">
        {{ fieldError("tooltip_description") }}
      </p>
    </div>

    <!-- discord_roles -->
    <div class="sm:col-span-3">
      <label class="block font-bold mb-2 text-sm">Discord Roles</label>
      <div class="flex flex-col gap-2">
        <div
          v-for="(dr, i) in modelValue.discord_roles"
          :key="i"
          class="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Guild ID"
            :value="dr.guild_id"
            :disabled="disabled"
            :class="[inputClass, 'flex-1']"
            @input="updateDiscordRole(i, { guild_id: ($event.target as HTMLInputElement).value })"
          />
          <input
            type="text"
            placeholder="Role ID"
            :value="dr.role_id"
            :disabled="disabled"
            :class="[inputClass, 'flex-1']"
            @input="updateDiscordRole(i, { role_id: ($event.target as HTMLInputElement).value })"
          />
          <button
            v-if="!disabled"
            type="button"
            class="text-(--color-text-muted) hover:text-red-400 transition-colors cursor-pointer"
            @click="removeDiscordRole(i)"
          >
            <i class="bi bi-trash" />
          </button>
        </div>
        <Button v-if="!disabled" @click="addDiscordRole">
          <i class="bi bi-plus-lg" /> Add Discord Role
        </Button>
      </div>
    </div>
  </div>
</template>
