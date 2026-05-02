<script setup lang="ts">
import { computed } from "vue";
import { useDiscordGuilds } from "@/services/discord/queries";
import { canManageRoles } from "@/services/discord/index";
import Button from "@/components/ui/Button.vue";
import RoleSelector from "./RoleSelector.vue";

export interface DiscordRoleEntry {
  guild_id: string;
  role_id: string;
}

const props = withDefaults(
  defineProps<{
    modelValue: DiscordRoleEntry[];
    disabled?: boolean;
  }>(),
  { disabled: false },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: DiscordRoleEntry[]): void;
}>();

const { data: guildsRaw, isLoading: guildsLoading } = useDiscordGuilds();
const guilds = computed(() => (guildsRaw.value ?? []).filter(canManageRoles));

// Roles in guilds the user is not in — always preserved in the API call
const hiddenRoles = computed(() => {
  if (!guildsRaw.value) return [];
  const knownIds = new Set(guildsRaw.value.map((g) => g.id));
  return props.modelValue.filter(
    (r) => r.guild_id && !knownIds.has(r.guild_id),
  );
});

const visibleRoles = computed(() => {
  if (!guildsRaw.value) return props.modelValue;
  const knownIds = new Set(guildsRaw.value.map((g) => g.id));
  return props.modelValue.filter(
    (r) => !r.guild_id || knownIds.has(r.guild_id),
  );
});

function emitVisible(visible: DiscordRoleEntry[]) {
  emit("update:modelValue", [...hiddenRoles.value, ...visible]);
}

function add() {
  emitVisible([...visibleRoles.value, { guild_id: "", role_id: "" }]);
}

function remove(index: number) {
  emitVisible(visibleRoles.value.filter((_, i) => i !== index));
}

function updateEntry(index: number, partial: Partial<DiscordRoleEntry>) {
  emitVisible(
    visibleRoles.value.map((r, i) => (i === index ? { ...r, ...partial } : r)),
  );
}

const inputClass =
  "w-full px-3 py-2 rounded-(--radius-btn) bg-(--color-primary) text-(--color-text) border border-(--color-contrast) focus:outline-none focus:border-(--color-active)";
</script>

<template>
  <div class="flex flex-col gap-2">
    <div
      v-for="(entry, i) in visibleRoles"
      :key="i"
      class="flex items-center gap-2"
    >
      <select
        :value="entry.guild_id"
        :disabled="disabled || guildsLoading"
        :class="[inputClass, 'flex-1']"
        @change="
          updateEntry(i, {
            guild_id: ($event.target as HTMLSelectElement).value,
          })
        "
      >
        <option value="" disabled>
          {{ guildsLoading ? "Loading..." : "Select server..." }}
        </option>
        <option v-for="guild in guilds" :key="guild.id" :value="guild.id">
          {{ guild.name }}
        </option>
      </select>
      <RoleSelector
        :guild-id="entry.guild_id"
        :model-value="entry.role_id"
        :disabled="disabled"
        class="flex-1"
        @update:model-value="updateEntry(i, { role_id: $event })"
      />
      <button
        v-if="!disabled"
        type="button"
        class="text-(--color-text-muted) hover:text-(--color-danger) transition-colors cursor-pointer"
        @click="remove(i)"
      >
        <i class="bi bi-trash" />
      </button>
    </div>

    <p v-if="hiddenRoles.length" class="text-(--color-text-muted) text-sm">
      +{{ hiddenRoles.length }} role{{ hiddenRoles.length !== 1 ? "s" : "" }} in
      servers you are not in
    </p>

    <Button v-if="!disabled" @click="add">
      <i class="bi bi-plus-lg" /> Add Discord Role
    </Button>
  </div>
</template>
