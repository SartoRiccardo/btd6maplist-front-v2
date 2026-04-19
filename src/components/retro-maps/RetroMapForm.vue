<script setup lang="ts">
import { computed } from "vue";
import { useTouchedProvider } from "@/composables/useTouchedFields";
import { useEmitOnChange } from "@/composables/useEmitOnChange";
import type { FormFieldError } from "@/services/api/formErrors";
import { useRetroGames } from "@/services/api/retro-games/queries";
import ImageDrop from "@/components/ui/ImageDrop.vue";

export interface RetroMapFormModel {
  name: string;
  retro_game_id: number | null;
  preview_url: string;
  preview_file: File | null;
}

const props = withDefaults(
  defineProps<{
    modelValue: RetroMapFormModel;
    disabled?: boolean;
    externalErrors?: FormFieldError[];
  }>(),
  { disabled: false, externalErrors: () => [] },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: RetroMapFormModel): void;
  (e: "errors", value: FormFieldError[]): void;
}>();

const { touchAll, clearTouched, isTouched, touch } = useTouchedProvider();
defineExpose({ touchAll, clearTouched });

function update(partial: Partial<RetroMapFormModel>) {
  for (const key of Object.keys(partial)) touch(key);
  emit("update:modelValue", { ...props.modelValue, ...partial });
}

const { data: retroGamesResponse } = useRetroGames({ per_page: 100 });

const retroGameOptions = computed(() =>
  (retroGamesResponse.value?.data ?? []).slice().sort(
    (a, b) =>
      a.game_id - b.game_id ||
      a.category_id - b.category_id ||
      a.subcategory_id - b.subcategory_id,
  ),
);

const ownErrors = computed<FormFieldError[]>(() => {
  const errors: FormFieldError[] = [];
  if (!props.modelValue.name.trim()) {
    errors.push({ path: "name", message: "Name is required.", source: "validation" });
  }
  if (props.modelValue.retro_game_id === null) {
    errors.push({ path: "retro_game_id", message: "Retro game is required.", source: "validation" });
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

function formatGameOption(game: (typeof retroGameOptions.value)[number]): string {
  const sub = game.subcategory_name ? ` (${game.subcategory_name})` : "";
  return `${game.game_name} – ${game.category_name}${sub}`;
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Name -->
    <div>
      <label for="retro-map-name" class="block font-bold mb-2">Name</label>
      <input
        id="retro-map-name"
        type="text"
        :value="modelValue.name"
        :disabled="disabled"
        placeholder="Map name"
        class="w-full px-3 py-2 rounded-(--radius-btn) bg-(--color-primary) text-(--color-text) border border-(--color-contrast) focus:outline-none focus:border-(--color-active)"
        :class="{ 'border-(--color-danger)!': fieldError('name') }"
        @input="update({ name: ($event.target as HTMLInputElement).value })"
      />
      <p v-if="fieldError('name')" class="text-(--color-danger) text-sm mt-1">
        {{ fieldError("name") }}
      </p>
    </div>

    <!-- Retro Game -->
    <div>
      <label for="retro-game" class="block font-bold mb-2">Retro Game</label>
      <select
        id="retro-game"
        :value="modelValue.retro_game_id ?? ''"
        :disabled="disabled"
        class="w-full px-3 py-2 rounded-(--radius-btn) bg-(--color-primary) text-(--color-text) border border-(--color-contrast) focus:outline-none focus:border-(--color-active)"
        :class="{ 'border-(--color-danger)!': fieldError('retro_game_id') }"
        @change="
          update({
            retro_game_id:
              ($event.target as HTMLSelectElement).value === ''
                ? null
                : Number(($event.target as HTMLSelectElement).value),
          })
        "
      >
        <option value="">Select a game...</option>
        <option v-for="game in retroGameOptions" :key="game.id" :value="game.id">
          {{ formatGameOption(game) }}
        </option>
      </select>
      <p
        v-if="fieldError('retro_game_id')"
        class="text-(--color-danger) text-sm mt-1"
      >
        {{ fieldError("retro_game_id") }}
      </p>
    </div>

    <!-- Preview Image -->
    <div>
      <label class="block font-bold mb-2">Preview Image</label>
      <ImageDrop
        :model-value="modelValue.preview_file"
        :initial-url="modelValue.preview_url"
        :disabled="disabled"
        placeholder="Drop image here or click to browse"
        @update:model-value="update({ preview_file: $event })"
        @clear-initial-url="update({ preview_url: '' })"
      />
    </div>
  </div>
</template>
