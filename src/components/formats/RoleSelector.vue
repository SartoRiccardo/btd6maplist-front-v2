<script setup lang="ts">
import { toRef } from "vue";
import { useI18n } from "vue-i18n";
import { useGuildRoles } from "@/services/discord/queries";

const props = withDefaults(
  defineProps<{
    guildId: string;
    modelValue: string;
    disabled?: boolean;
  }>(),
  { disabled: false },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const { t } = useI18n({ inheritLocale: true });

const {
  data: roles,
  isLoading,
  isError,
} = useGuildRoles(toRef(props, "guildId"));

const inputClass =
  "w-full px-3 py-2 rounded-(--radius-btn) bg-(--color-primary) text-(--color-text) border border-(--color-contrast) focus:outline-none focus:border-(--color-active)";
</script>

<template>
  <div class="flex-1">
    <select
      :value="modelValue"
      :disabled="disabled || !guildId || isLoading || isError"
      :class="inputClass"
      @change="
        emit('update:modelValue', ($event.target as HTMLSelectElement).value)
      "
    >
      <option value="" disabled>
        {{
          !guildId
            ? t("selectServerFirst")
            : isLoading
              ? t("common.loading")
              : isError
                ? t("failedToLoadRoles")
                : t("selectRole")
        }}
      </option>
      <option
        v-for="role in roles?.filter((r) => r.name !== '@everyone')"
        :key="role.id"
        :value="role.id"
      >
        {{ role.name }}
      </option>
    </select>
    <p v-if="isError" class="text-(--color-danger) text-xs mt-1">
      {{ t("botMayNotBeInServer") }}
    </p>
  </div>
</template>

<i18n lang="json">
{
  "en": {
    "selectServerFirst": "Select a server first",
    "failedToLoadRoles": "Failed to load roles",
    "selectRole": "Select role...",
    "botMayNotBeInServer": "The bot may not be in this server."
  }
}
</i18n>
