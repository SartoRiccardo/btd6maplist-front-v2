<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useTouchedProvider } from "@/composables/useTouchedFields";
import { useEmitOnChange } from "@/composables/useEmitOnChange";
import type { FormFieldError } from "@/services/api/formErrors";
import { useRetroGames } from "@/services/api/retro-games/queries";
import ImageDrop from "@/components/ui/ImageDrop.vue";

export interface RetroMapFormModel {
  name: string;
  sort_order: number;
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

const { t } = useI18n({ inheritLocale: true });

const { touchAll, clearTouched, isTouched, touch } = useTouchedProvider();
defineExpose({ touchAll, clearTouched });

function update(partial: Partial<RetroMapFormModel>) {
  for (const key of Object.keys(partial)) touch(key);
  emit("update:modelValue", { ...props.modelValue, ...partial });
}

const { data: retroGamesResponse } = useRetroGames({ per_page: 100 });

const retroGameOptions = computed(() =>
  (retroGamesResponse.value?.data ?? [])
    .slice()
    .sort(
      (a, b) =>
        a.game_id - b.game_id ||
        a.category_id - b.category_id ||
        a.subcategory_id - b.subcategory_id,
    ),
);

const ownErrors = computed<FormFieldError[]>(() => {
  const errors: FormFieldError[] = [];
  if (!props.modelValue.name.trim()) {
    errors.push({
      path: "name",
      message: t("nameRequired"),
      source: "validation",
    });
  }
  if (props.modelValue.retro_game_id === null) {
    errors.push({
      path: "retro_game_id",
      message: t("retroGameRequired"),
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

function formatGameOption(
  game: (typeof retroGameOptions.value)[number],
): string {
  const sub = game.subcategory_name ? ` (${game.subcategory_name})` : "";
  return `${game.game_name} – ${game.category_name}${sub}`;
}
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Column 1: Name + Retro Game -->
    <div class="flex flex-col gap-6">
      <!-- Name -->
      <div>
        <label for="retro-map-name" class="block font-bold mb-2">{{
          t("common.name")
        }}</label>
        <input
          id="retro-map-name"
          type="text"
          :value="modelValue.name"
          :disabled="disabled"
          :placeholder="t('mapName')"
          class="w-full px-3 py-2 rounded-(--radius-btn) bg-(--color-primary) text-(--color-text) border border-(--color-contrast) focus:outline-none focus:border-(--color-active)"
          :class="{ 'border-(--color-danger)!': fieldError('name') }"
          @input="update({ name: ($event.target as HTMLInputElement).value })"
        />
        <p v-if="fieldError('name')" class="text-(--color-danger) text-sm mt-1">
          {{ fieldError("name") }}
        </p>
      </div>

      <!-- Sort Order -->
      <div>
        <label for="retro-map-sort-order" class="block font-bold mb-2"
          >{{ t("sortOrder") }}</label
        >
        <input
          id="retro-map-sort-order"
          type="number"
          :value="modelValue.sort_order"
          :disabled="disabled"
          class="w-full px-3 py-2 rounded-(--radius-btn) bg-(--color-primary) text-(--color-text) border border-(--color-contrast) focus:outline-none focus:border-(--color-active)"
          :class="{ 'border-(--color-danger)!': fieldError('sort_order') }"
          @input="
            update({
              sort_order: Number(($event.target as HTMLInputElement).value),
            })
          "
        />
        <p
          v-if="fieldError('sort_order')"
          class="text-(--color-danger) text-sm mt-1"
        >
          {{ fieldError("sort_order") }}
        </p>
        <p v-else class="text-(--color-text-muted) text-sm mt-1">
          {{ t("sortOrderHint") }}
        </p>
      </div>

      <!-- Retro Game -->
      <div>
        <label for="retro-game" class="block font-bold mb-2">{{
          t("retroGame")
        }}</label>
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
          <option value="">{{ t("selectGame") }}</option>
          <option
            v-for="game in retroGameOptions"
            :key="game.id"
            :value="game.id"
          >
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
    </div>

    <!-- Column 2: Preview Image -->
    <div>
      <label class="block font-bold mb-2">{{ t("previewImage") }}</label>
      <ImageDrop
        :model-value="modelValue.preview_file"
        :initial-url="modelValue.preview_url"
        :disabled="disabled"
        :placeholder="t('dropImage')"
        @update:model-value="update({ preview_file: $event })"
        @clear-initial-url="update({ preview_url: '' })"
      />
      <p
        v-if="fieldError('preview_url') || fieldError('preview_file')"
        class="text-(--color-danger) text-sm mt-1"
      >
        {{ fieldError("preview_url") ?? fieldError("preview_file") }}
      </p>
    </div>
  </div>
</template>

<i18n lang="json">
{
  "en": {
    "mapName": "Map name",
    "sortOrder": "Sort Order",
    "sortOrderHint": "yeah this is terrible UX, but for now this is what you get",
    "retroGame": "Retro Game",
    "selectGame": "Select a game...",
    "previewImage": "Preview Image",
    "dropImage": "Drop image here or click to browse",
    "nameRequired": "Name is required.",
    "retroGameRequired": "Retro game is required."
  }
}
</i18n>
