<script setup lang="ts">
import { ref, computed } from "vue";
import { useTouchedProvider } from "@/composables/useTouchedFields";
import { useEmitOnChange } from "@/composables/useEmitOnChange";
import type { FormFieldError } from "@/services/api/formErrors";
import type { Format } from "@/services/api/formats/types";
import type { User } from "@/services/api/users/types";
import { FORMAT_ICONS } from "@/constants/formats";
import { search } from "@/services/api/search";
import Button from "@/components/ui/Button.vue";
import BoxedCheckbox from "@/components/ui/BoxedCheckbox.vue";
import AsyncSelect from "@/components/ui/AsyncSelect.vue";
import ListEditor from "@/components/ui/ListEditor.vue";

export interface CompletionFormModel {
  format_id: number | null;
  black_border: boolean;
  no_geraldo: boolean;
  lcc_enabled: boolean;
  lcc_leftover: number | null;
  players: string[];
}

const props = withDefaults(
  defineProps<{
    modelValue: CompletionFormModel;
    disabled?: boolean;
    externalErrors?: FormFieldError[];
    formats: Format[];
    initialPlayers?: User[];
  }>(),
  {
    disabled: false,
    externalErrors: () => [],
    initialPlayers: () => [],
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: CompletionFormModel): void;
  (e: "errors", value: FormFieldError[]): void;
}>();

const { touchAll, clearTouched, isTouched, touch } = useTouchedProvider();
defineExpose({ touchAll, clearTouched });

const selectedUsers = ref<Map<number, User | null>>(
  new Map(props.initialPlayers.map((u, i) => [i, u])),
);

function update(partial: Partial<CompletionFormModel>) {
  for (const key of Object.keys(partial)) touch(key);
  emit("update:modelValue", { ...props.modelValue, ...partial });
}

function updatePlayerAt(index: number, user: User | null) {
  selectedUsers.value = new Map(selectedUsers.value).set(index, user);
  touch(`players.${index}`);
  const next = [...props.modelValue.players];
  next[index] = user?.discord_id ?? "";
  emit("update:modelValue", { ...props.modelValue, players: next });
}

function onPlayersChange(newPlayers: string[]) {
  const oldPlayers = props.modelValue.players;
  if (newPlayers.length < oldPlayers.length) {
    let removedAt = oldPlayers.length - 1;
    for (let i = 0; i < newPlayers.length; i++) {
      if (newPlayers[i] !== oldPlayers[i]) {
        removedAt = i;
        break;
      }
    }
    const newMap = new Map<number, User | null>();
    for (const [idx, user] of selectedUsers.value) {
      if (idx < removedAt) newMap.set(idx, user);
      else if (idx > removedAt) newMap.set(idx - 1, user);
    }
    selectedUsers.value = newMap;
  } else {
    selectedUsers.value = new Map(selectedUsers.value).set(
      newPlayers.length - 1,
      null,
    );
  }
  emit("update:modelValue", { ...props.modelValue, players: newPlayers });
}

function formatIcon(formatId: number): string | undefined {
  return FORMAT_ICONS.find((f) => f.id === formatId)?.image;
}

async function searchUsers(query: string): Promise<User[]> {
  const results = await search({ q: query, entities: ["users"], limit: 10 });
  return results.filter((r) => r.type === "user").map((r) => r.result as User);
}

// --- Validation ---

const ownErrors = computed<FormFieldError[]>(() => {
  const errors: FormFieldError[] = [];

  if (props.modelValue.format_id == null) {
    errors.push({
      path: "format_id",
      message: "Please select a format.",
      source: "validation",
    });
  }

  for (let i = 0; i < props.modelValue.players.length; i++) {
    if (!props.modelValue.players[i]) {
      errors.push({
        path: `players.${i}`,
        message: "A player must be selected.",
        source: "validation",
      });
    }
  }

  if (
    props.modelValue.lcc_enabled &&
    (props.modelValue.lcc_leftover == null ||
      !Number.isFinite(props.modelValue.lcc_leftover) ||
      props.modelValue.lcc_leftover < 0)
  ) {
    errors.push({
      path: "lcc_leftover",
      message: "Saveup must be a non-negative number.",
      source: "validation",
    });
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
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Format Selector -->
    <div>
      <label class="block font-bold mb-2">Format</label>
      <div class="flex flex-wrap gap-2">
        <Button
          v-for="fmt in formats"
          :key="fmt.id"
          :active="modelValue.format_id === fmt.id"
          :disabled="disabled"
          @click="update({ format_id: fmt.id })"
        >
          <span class="flex items-center gap-2">
            <img
              v-if="formatIcon(fmt.id)"
              :src="formatIcon(fmt.id)"
              :alt="fmt.name"
              class="w-5 h-5"
            />
            {{ fmt.name }}
          </span>
        </Button>
      </div>
      <p v-if="fieldError('format_id')" class="text-red-400 text-sm mt-1">
        {{ fieldError("format_id") }}
      </p>
    </div>

    <!-- Run Modifiers -->
    <div>
      <label class="block font-bold mb-2">Run Modifiers</label>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <BoxedCheckbox
          :model-value="modelValue.black_border"
          :disabled="disabled"
          label="Black Border"
          icon="/images/medals/medal_bb.webp"
          @update:model-value="update({ black_border: $event })"
        />
        <BoxedCheckbox
          :model-value="modelValue.no_geraldo"
          :disabled="disabled"
          label="No Optimal Hero"
          icon="/images/medals/medal_nogerry.webp"
          @update:model-value="update({ no_geraldo: $event })"
        />
        <BoxedCheckbox
          :model-value="modelValue.lcc_enabled"
          :disabled="disabled"
          label="LCC"
          icon="/images/medals/medal_lcc.webp"
          @update:model-value="update({ lcc_enabled: $event })"
        />
      </div>

      <div v-if="modelValue.lcc_enabled" class="mt-2">
        <label for="lcc-leftover" class="block text-sm mb-1">Saveup</label>
        <input
          id="lcc-leftover"
          type="number"
          min="0"
          :value="modelValue.lcc_leftover"
          :disabled="disabled"
          class="w-40 px-3 py-2 rounded-(--radius-btn) bg-(--color-primary) text-(--color-text) border border-(--color-contrast) focus:outline-none focus:border-(--color-active)"
          :class="{ 'border-red-500!': fieldError('lcc_leftover') }"
          @input="
            update({
              lcc_leftover: ($event.target as HTMLInputElement).valueAsNumber,
            })
          "
        />
        <p v-if="fieldError('lcc_leftover')" class="text-red-400 text-sm mt-1">
          {{ fieldError("lcc_leftover") }}
        </p>
      </div>
    </div>

    <!-- Players -->
    <div>
      <label class="block font-bold mb-2">Players</label>
      <ListEditor
        :model-value="modelValue.players"
        default=""
        :disabled="disabled"
        :min-items="1"
        add-label="Add Player"
        @update:model-value="onPlayersChange"
      >
        <template #item="{ index }">
          <div>
            <AsyncSelect
              :model-value="selectedUsers.get(index) ?? null"
              :search-fn="searchUsers"
              :display-value="(u: User) => u.name"
              :disabled="disabled"
              placeholder="Search players..."
              :min-chars="3"
              @update:model-value="updatePlayerAt(index, $event)"
            />
            <p
              v-if="fieldError(`players.${index}`)"
              class="text-red-400 text-xs mt-1"
            >
              {{ fieldError(`players.${index}`) }}
            </p>
          </div>
        </template>
      </ListEditor>
    </div>
  </div>
</template>
