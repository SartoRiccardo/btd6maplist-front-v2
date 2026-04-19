<script setup lang="ts">
import Button from "@/components/ui/Button.vue";

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

function add() {
  emit("update:modelValue", [...props.modelValue, { guild_id: "", role_id: "" }]);
}

function remove(index: number) {
  emit("update:modelValue", props.modelValue.filter((_, i) => i !== index));
}

function updateEntry(index: number, partial: Partial<DiscordRoleEntry>) {
  emit(
    "update:modelValue",
    props.modelValue.map((r, i) => (i === index ? { ...r, ...partial } : r)),
  );
}

const inputClass =
  "w-full px-3 py-2 rounded-(--radius-btn) bg-(--color-primary) text-(--color-text) border border-(--color-contrast) focus:outline-none focus:border-(--color-active)";
</script>

<template>
  <div class="flex flex-col gap-2">
    <div
      v-for="(entry, i) in modelValue"
      :key="i"
      class="flex items-center gap-2"
    >
      <input
        type="text"
        placeholder="Guild ID"
        :value="entry.guild_id"
        :disabled="disabled"
        :class="[inputClass, 'flex-1']"
        @input="updateEntry(i, { guild_id: ($event.target as HTMLInputElement).value })"
      />
      <input
        type="text"
        placeholder="Role ID"
        :value="entry.role_id"
        :disabled="disabled"
        :class="[inputClass, 'flex-1']"
        @input="updateEntry(i, { role_id: ($event.target as HTMLInputElement).value })"
      />
      <button
        v-if="!disabled"
        type="button"
        class="text-(--color-text-muted) hover:text-red-400 transition-colors cursor-pointer"
        @click="remove(i)"
      >
        <i class="bi bi-trash" />
      </button>
    </div>

    <Button v-if="!disabled" @click="add">
      <i class="bi bi-plus-lg" /> Add Discord Role
    </Button>
  </div>
</template>
