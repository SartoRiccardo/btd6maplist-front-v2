<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useTouchedProvider } from "@/composables/useTouchedFields";
import { useEmitOnChange } from "@/composables/useEmitOnChange";
import type { FormFieldError } from "@/services/api/formErrors";

export interface UserFormModel {
  discord_id: string;
  name: string;
}

const props = withDefaults(
  defineProps<{
    modelValue: UserFormModel;
    disabled?: boolean;
    externalErrors?: FormFieldError[];
  }>(),
  { disabled: false, externalErrors: () => [] },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: UserFormModel): void;
  (e: "errors", value: FormFieldError[]): void;
}>();

const { t } = useI18n({ inheritLocale: true });

const { touchAll, clearTouched, isTouched, touch } = useTouchedProvider();
defineExpose({ touchAll, clearTouched });

function update(partial: Partial<UserFormModel>) {
  for (const key of Object.keys(partial)) touch(key);
  emit("update:modelValue", { ...props.modelValue, ...partial });
}

const ownErrors = computed<FormFieldError[]>(() => {
  const errors: FormFieldError[] = [];
  if (!props.modelValue.discord_id?.trim())
    errors.push({
      path: "discord_id",
      message: t("discordIdRequired"),
      source: "validation",
    });
  if (!props.modelValue.name?.trim())
    errors.push({
      path: "name",
      message: t("usernameRequired"),
      source: "validation",
    });
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
</script>

<template>
  <div class="space-y-3">
    <div>
      <label class="block text-sm font-bold mb-1">{{ t("discordId") }}</label>
      <input
        :value="modelValue.discord_id"
        type="text"
        placeholder="123456789012345678"
        :disabled="disabled"
        class="w-full px-3 py-1.5 rounded-(--radius-btn) bg-(--color-primary) text-(--color-text) border border-(--color-contrast) focus:outline-none focus:border-(--color-active) disabled:opacity-50"
        @input="
          update({ discord_id: ($event.target as HTMLInputElement).value })
        "
      />
      <p v-if="fieldError('discord_id')" class="text-(--color-danger) text-xs mt-1">
        {{ fieldError("discord_id") }}
      </p>
    </div>

    <div>
      <label class="block text-sm font-bold mb-1">{{ t("username") }}</label>
      <input
        :value="modelValue.name"
        type="text"
        :placeholder="t('username')"
        :disabled="disabled"
        class="w-full px-3 py-1.5 rounded-(--radius-btn) bg-(--color-primary) text-(--color-text) border border-(--color-contrast) focus:outline-none focus:border-(--color-active) disabled:opacity-50"
        @input="update({ name: ($event.target as HTMLInputElement).value })"
      />
      <p v-if="fieldError('name')" class="text-(--color-danger) text-xs mt-1">
        {{ fieldError("name") }}
      </p>
    </div>
  </div>
</template>

<i18n lang="json">
{
  "en": {
    "discordId": "Discord ID",
    "username": "Username",
    "discordIdRequired": "Discord ID is required",
    "usernameRequired": "Username is required"
  }
}
</i18n>
