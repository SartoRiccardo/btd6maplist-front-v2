<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useTouchedFields } from "@/composables/useTouchedFields";
import { useEmitOnChange } from "@/composables/useEmitOnChange";
import type { FormFieldError } from "@/services/api/formErrors";
import {
  FORMAT_MAPLIST,
  FORMAT_MAPLIST_ALL_VER,
  FORMAT_EXPERT_LIST,
  FORMAT_BEST_OF_THE_BEST,
  FORMAT_NOSTALGIA_PACK,
  FORMAT_ICONS,
} from "@/constants/formats";
import {
  EXPERT_DIFFICULTIES,
  BOTB_DIFFICULTIES,
} from "@/constants/difficulties";
import { getRetroMaps, getRetroMap } from "@/services/api/retro-maps";
import { useRetroGames } from "@/services/api/retro-games/queries";
import type { RetroMap } from "@/services/api/maps/types";
import AsyncSelect from "@/components/ui/AsyncSelect.vue";
import Badge from "@/components/common/Badge.vue";
import OptimalHeroesInput from "./OptimalHeroesInput.vue";
import type { ListPlacementSlice, RemakeOfValue } from "./types";

const props = withDefaults(
  defineProps<{
    modelValue: ListPlacementSlice;
    disabled?: boolean;
    externalErrors?: FormFieldError[];
    editableFormats: number[];
    prefilledRetroMapId?: number;
  }>(),
  { disabled: false, externalErrors: () => [] },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: ListPlacementSlice): void;
  (e: "errors", value: FormFieldError[]): void;
}>();

const { isTouched, touch } = useTouchedFields();

function update(partial: Partial<ListPlacementSlice>) {
  for (const key of Object.keys(partial)) touch(key);
  emit("update:modelValue", { ...props.modelValue, ...partial });
}

function formatIcon(id: number): string | undefined {
  return FORMAT_ICONS.find((f) => f.id === id)?.image;
}

const canEditMaplist = computed(() =>
  props.editableFormats.includes(FORMAT_MAPLIST),
);
const canEditAllVer = computed(() =>
  props.editableFormats.includes(FORMAT_MAPLIST_ALL_VER),
);
const canEditExpert = computed(() =>
  props.editableFormats.includes(FORMAT_EXPERT_LIST),
);
const canEditBotB = computed(() =>
  props.editableFormats.includes(FORMAT_BEST_OF_THE_BEST),
);
const canEditNP = computed(() =>
  props.editableFormats.includes(FORMAT_NOSTALGIA_PACK),
);

// --- Nostalgia Pack: game select → map select ---

const { data: retroGamesResponse } = useRetroGames({ per_page: 100 });

interface GameOption {
  game_id: number;
  game_name: string;
}

const uniqueGames = computed<GameOption[]>(() => {
  const all = retroGamesResponse.value?.data ?? [];
  const seen = new Set<number>();
  const result: GameOption[] = [];
  for (const g of all) {
    if (!seen.has(g.game_id)) {
      seen.add(g.game_id);
      result.push({ game_id: g.game_id, game_name: g.game_name });
    }
  }
  return result;
});

// Derive game selection from model
const selectedGameId = computed(
  () => props.modelValue.remake_of?.game_id ?? null,
);

interface RetroMapOption {
  id: number;
  label: string;
}

const selectedRetroMap = computed<RetroMapOption | null>(() => {
  const r = props.modelValue.remake_of;
  if (!r) return null;
  return { id: r.map_id, label: r.map_name };
});

// Cache remake_of per game so switching back restores the selection
let cachedRemakeByGame = new Map<number, RemakeOfValue>();

function onGameChange(gameId: number | null) {
  if (gameId === activeGameId.value) return;
  // Cache current selection before switching
  const current = props.modelValue.remake_of;
  if (current) {
    cachedRemakeByGame.set(current.game_id, current);
  }
  // Restore cached selection for the new game, or clear
  const cached =
    gameId != null ? (cachedRemakeByGame.get(gameId) ?? null) : null;
  update({ remake_of: cached });
  pendingGameId.value = gameId;
}

// Temp storage for game selection before a map is picked
const pendingGameId = ref<number | null>(selectedGameId.value);

const activeGameId = computed(
  () => pendingGameId.value ?? selectedGameId.value,
);

async function searchRetroMaps(query: string): Promise<RetroMapOption[]> {
  const response = await getRetroMaps({
    search: query,
    per_page: 5,
    game_id: activeGameId.value ?? undefined,
  });
  return response.data.map((m: RetroMap) => ({
    id: m.id,
    label: m.name,
  }));
}

function onRetroMapSelect(option: RetroMapOption | null) {
  if (!option || activeGameId.value == null) {
    update({ remake_of: null });
    return;
  }
  const game = uniqueGames.value.find((g) => g.game_id === activeGameId.value);
  update({
    remake_of: {
      game_id: activeGameId.value,
      game_name: game?.game_name ?? "",
      map_id: option.id,
      map_name: option.label,
    },
  });
}

// Pre-load map if it comes prefilled

const prefilledRetroMapId = computed(() => props.prefilledRetroMapId);

watch(prefilledRetroMapId, async (retroMapId) => {
  if (!retroMapId) return;

  const map: RetroMap = await getRetroMap(retroMapId);
  pendingGameId.value = map.game.game_id;
  update({
    remake_of: {
      game_id: map.game.game_id,
      game_name: map.game.game_name,
      map_id: map.id,
      map_name: map.name,
    },
  });
}, { immediate: true });

// --- Validation ---

const ownErrors = computed<FormFieldError[]>(() => {
  const errors: FormFieldError[] = [];
  if (
    props.modelValue.placement_curver != null &&
    props.modelValue.placement_curver < 1
  ) {
    errors.push({
      path: "placement_curver",
      message: "Placement must be at least 1.",
      source: "validation",
    });
  }
  if (
    props.modelValue.placement_allver != null &&
    props.modelValue.placement_allver < 1
  ) {
    errors.push({
      path: "placement_allver",
      message: "Placement must be at least 1.",
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

function onPlacementInput(
  field: "placement_curver" | "placement_allver",
  value: string,
) {
  const num = value.trim() === "" ? null : Number(value);
  update({ [field]: num !== null && !isNaN(num) ? num : null });
}

function onDifficultyChange(
  field: "difficulty" | "botb_difficulty",
  value: string,
) {
  const num = value === "" ? null : Number(value);
  update({ [field]: num });
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>{{ prefilledRetroMapId }}</div>
    <!-- Row 1: Maplist placements -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div>
        <label
          for="placement-curver"
          class="flex items-center gap-2 font-bold mb-2"
        >
          <Badge :src="formatIcon(FORMAT_MAPLIST)!" />
          Maplist Placement
        </label>
        <input
          id="placement-curver"
          type="number"
          min="1"
          :value="modelValue.placement_curver ?? ''"
          :disabled="disabled || !canEditMaplist"
          placeholder="Position"
          class="w-full px-3 py-2 rounded-(--radius-btn) bg-(--color-primary) text-(--color-text) border border-(--color-contrast) focus:outline-none focus:border-(--color-active)"
          :class="{
            'border-(--color-danger)!': fieldError('placement_curver'),
            'cursor-not-allowed!': !canEditMaplist,
          }"
          @input="
            onPlacementInput(
              'placement_curver',
              ($event.target as HTMLInputElement).value,
            )
          "
        />
        <p
          v-if="fieldError('placement_curver')"
          class="text-(--color-danger) text-sm mt-1"
        >
          {{ fieldError("placement_curver") }}
        </p>
      </div>

      <div>
        <label
          for="placement-allver"
          class="flex items-center gap-2 font-bold mb-2"
        >
          <Badge :src="formatIcon(FORMAT_MAPLIST_ALL_VER)!" />
          Maplist (All Versions) Placement
        </label>
        <input
          id="placement-allver"
          type="number"
          min="1"
          :value="modelValue.placement_allver ?? ''"
          :disabled="disabled || !canEditAllVer"
          placeholder="Position"
          class="w-full px-3 py-2 rounded-(--radius-btn) bg-(--color-primary) text-(--color-text) border border-(--color-contrast) focus:outline-none focus:border-(--color-active)"
          :class="{
            'border-(--color-danger)!': fieldError('placement_allver'),
            'cursor-not-allowed!': !canEditAllVer,
          }"
          @input="
            onPlacementInput(
              'placement_allver',
              ($event.target as HTMLInputElement).value,
            )
          "
        />
        <p
          v-if="fieldError('placement_allver')"
          class="text-(--color-danger) text-sm mt-1"
        >
          {{ fieldError("placement_allver") }}
        </p>
      </div>
    </div>

    <!-- Row 2: Difficulties -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div>
        <label for="difficulty" class="flex items-center gap-2 font-bold mb-2">
          <Badge :src="formatIcon(FORMAT_EXPERT_LIST)!" />
          Expert List Difficulty
        </label>
        <select
          id="difficulty"
          :value="modelValue.difficulty ?? ''"
          :disabled="disabled || !canEditExpert"
          class="w-full px-3 py-2 rounded-(--radius-btn) bg-(--color-primary) text-(--color-text) border border-(--color-contrast) focus:outline-none focus:border-(--color-active)"
          :class="{ 'cursor-not-allowed!': !canEditExpert }"
          @change="
            onDifficultyChange(
              'difficulty',
              ($event.target as HTMLSelectElement).value,
            )
          "
        >
          <option value="">None</option>
          <option
            v-for="diff in EXPERT_DIFFICULTIES"
            :key="typeof diff.value === 'number' ? diff.value : diff.value[0]"
            :value="typeof diff.value === 'number' ? diff.value : diff.value[0]"
          >
            {{ diff.name }}
          </option>
        </select>
        <p
          v-if="fieldError('difficulty')"
          class="text-(--color-danger) text-sm mt-1"
        >
          {{ fieldError("difficulty") }}
        </p>
      </div>

      <div>
        <label
          for="botb-difficulty"
          class="flex items-center gap-2 font-bold mb-2"
        >
          <Badge :src="formatIcon(FORMAT_BEST_OF_THE_BEST)!" />
          Best of the Best Difficulty
        </label>
        <select
          id="botb-difficulty"
          :value="modelValue.botb_difficulty ?? ''"
          :disabled="disabled || !canEditBotB"
          class="w-full px-3 py-2 rounded-(--radius-btn) bg-(--color-primary) text-(--color-text) border border-(--color-contrast) focus:outline-none focus:border-(--color-active)"
          :class="{ 'cursor-not-allowed!': !canEditBotB }"
          @change="
            onDifficultyChange(
              'botb_difficulty',
              ($event.target as HTMLSelectElement).value,
            )
          "
        >
          <option value="">None</option>
          <option
            v-for="diff in BOTB_DIFFICULTIES"
            :key="typeof diff.value === 'number' ? diff.value : diff.value[0]"
            :value="typeof diff.value === 'number' ? diff.value : diff.value[0]"
          >
            {{ diff.name }}
          </option>
        </select>
        <p
          v-if="fieldError('botb_difficulty')"
          class="text-(--color-danger) text-sm mt-1"
        >
          {{ fieldError("botb_difficulty") }}
        </p>
      </div>
    </div>

    <!-- Row 3: Nostalgia Pack -->
    <div>
      <label class="flex items-center gap-2 font-bold mb-2">
        <Badge :src="formatIcon(FORMAT_NOSTALGIA_PACK)!" />
        Nostalgia Pack Remake Of
      </label>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <select
          :value="activeGameId ?? ''"
          :disabled="disabled || !canEditNP"
          class="w-full px-3 py-2 rounded-(--radius-btn) bg-(--color-primary) text-(--color-text) border border-(--color-contrast) focus:outline-none focus:border-(--color-active)"
          :class="{ 'cursor-not-allowed!': !canEditNP }"
          @change="
            onGameChange(
              ($event.target as HTMLSelectElement).value === ''
                ? null
                : Number(($event.target as HTMLSelectElement).value),
            )
          "
        >
          <option value="">None</option>
          <option
            v-for="game in uniqueGames"
            :key="game.game_id"
            :value="game.game_id"
          >
            {{ game.game_name }}
          </option>
        </select>

        <AsyncSelect
          v-if="activeGameId != null"
          :key="activeGameId"
          :model-value="selectedRetroMap"
          :search-fn="searchRetroMaps"
          :display-value="(o: RetroMapOption) => o.label"
          :disabled="disabled || !canEditNP"
          :min-chars="0"
          :debounce="400"
          placeholder="Search maps..."
          @update:model-value="onRetroMapSelect"
        />
      </div>
      <p
        v-if="fieldError('remake_of')"
        class="text-(--color-danger) text-sm mt-1"
      >
        {{ fieldError("remake_of") }}
      </p>
    </div>

    <!-- Optimal Heroes -->
    <div>
      <label class="block font-bold mb-2">Optimal Heroes</label>
      <OptimalHeroesInput
        :model-value="modelValue.optimal_heros"
        :disabled="disabled"
        @update:model-value="update({ optimal_heros: $event })"
      />
      <p
        v-if="fieldError('optimal_heros')"
        class="text-(--color-danger) text-sm mt-1"
      >
        {{ fieldError("optimal_heros") }}
      </p>
    </div>
  </div>
</template>
