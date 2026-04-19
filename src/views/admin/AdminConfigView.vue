<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useConfig, useUpdateConfig } from "@/services/api/config/queries";
import { ApiError } from "@/services/api/client";
import { permissions } from "@/constants/permissions";
import {
  FORMAT_MAPLIST,
  FORMAT_EXPERT_LIST,
  FORMAT_ICONS,
} from "@/constants/formats";
import Panel from "@/components/ui/Panel.vue";
import Button from "@/components/ui/Button.vue";
import Badge from "@/components/common/Badge.vue";

interface ConfigFieldDef {
  key: string;
  label: string;
  step?: number;
}

interface ConfigCategoryDef {
  id: string;
  label: string;
  icon?: string;
  fields: ConfigFieldDef[];
}

const MAPLIST_KEYS = new Set([
  "points_top_map",
  "points_bottom_map",
  "formula_slope",
  "points_extra_lcc",
  "points_multi_gerry",
  "points_multi_bb",
  "decimal_digits",
  "map_count",
]);

const EXPERT_KEYS = new Set([
  "exp_points_casual",
  "exp_points_medium",
  "exp_points_high",
  "exp_points_true",
  "exp_points_extreme",
  "exp_nogerry_points_casual",
  "exp_nogerry_points_medium",
  "exp_nogerry_points_high",
  "exp_nogerry_points_true",
  "exp_nogerry_points_extreme",
  "exp_bb_multi",
  "exp_lcc_extra",
]);

const MISC_KEYS = new Set(["current_btd6_ver"]);

const MAPLIST_CATEGORY: ConfigCategoryDef = {
  id: "maplist",
  label: "Maplist",
  icon: FORMAT_ICONS.find((f) => f.id === FORMAT_MAPLIST)?.image,
  fields: [
    { key: "points_top_map", label: "Points (Top Map)" },
    { key: "points_bottom_map", label: "Points (Bottom Map)" },
    { key: "formula_slope", label: "Formula Slope", step: 0.001 },
    { key: "points_extra_lcc", label: "LCC Bonus Points" },
    { key: "points_multi_gerry", label: "No Optimal Hero Multiplier" },
    { key: "points_multi_bb", label: "Black Border Multiplier" },
    { key: "decimal_digits", label: "Decimal Digits" },
    { key: "map_count", label: "Map Count" },
  ],
};

const EXPERT_CATEGORY: ConfigCategoryDef = {
  id: "expert_list",
  label: "Expert List",
  icon: FORMAT_ICONS.find((f) => f.id === FORMAT_EXPERT_LIST)?.image,
  fields: [
    { key: "exp_points_casual", label: "Casual Points" },
    { key: "exp_points_medium", label: "Medium Points" },
    { key: "exp_points_high", label: "High Points" },
    { key: "exp_points_true", label: "True Points" },
    { key: "exp_points_extreme", label: "Extreme Points" },
    {
      key: "exp_nogerry_points_casual",
      label: "Casual No Optimal Hero Points",
    },
    {
      key: "exp_nogerry_points_medium",
      label: "Medium No Optimal Hero Points",
    },
    { key: "exp_nogerry_points_high", label: "High No Optimal Hero Points" },
    { key: "exp_nogerry_points_true", label: "True No Optimal Hero Points" },
    {
      key: "exp_nogerry_points_extreme",
      label: "Extreme No Optimal Hero Points",
    },
    { key: "exp_bb_multi", label: "Black Border Multiplier" },
    { key: "exp_lcc_extra", label: "LCC Extra Points" },
  ],
};

const auth = useAuthStore();

const canEditMaplist = computed(() =>
  auth.hasPermission(permissions.config.edit, FORMAT_MAPLIST),
);
const canEditExpert = computed(() =>
  auth.hasPermission(permissions.config.edit, FORMAT_EXPERT_LIST),
);
const canEditAny = computed(() => canEditMaplist.value || canEditExpert.value);

const { data: config, isLoading } = useConfig();
const { mutateAsync: saveConfig } = useUpdateConfig();

const formModel = ref<Record<string, number>>({});
let formInitialized = false;

watch(
  () => config.value,
  (cfg) => {
    if (cfg && !formInitialized) {
      formInitialized = true;
      formModel.value = { ...(cfg as unknown as Record<string, number>) };
    }
  },
  { immediate: true },
);

const extraMiscFields = computed<ConfigFieldDef[]>(() => {
  if (!config.value) return [];
  return Object.keys(config.value)
    .filter(
      (k) => !MAPLIST_KEYS.has(k) && !EXPERT_KEYS.has(k) && !MISC_KEYS.has(k),
    )
    .map((k) => ({ key: k, label: k }));
});

const miscCategory = computed<ConfigCategoryDef>(() => ({
  id: "miscellaneous",
  label: "Miscellaneous",
  fields: [
    { key: "current_btd6_ver", label: "Current BTD6 Version" },
    ...extraMiscFields.value,
  ],
}));

const visibleCategories = computed<ConfigCategoryDef[]>(() => {
  const cats: ConfigCategoryDef[] = [];
  if (canEditMaplist.value) cats.push(MAPLIST_CATEGORY);
  if (canEditExpert.value) cats.push(EXPERT_CATEGORY);
  if (canEditAny.value) cats.push(miscCategory.value);
  return cats;
});

const isBusy = ref(false);
const submitError = ref<string | null>(null);
const submitSuccess = ref(false);

async function handleSave() {
  submitError.value = null;
  submitSuccess.value = false;
  isBusy.value = true;
  try {
    await saveConfig(formModel.value as never);
    submitSuccess.value = true;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      submitError.value = "Failed to save config. Please try again.";
    } else {
      submitError.value = "Something went wrong. Please try again.";
    }
  } finally {
    isBusy.value = false;
  }
}
</script>

<template>
  <div>
    <h1
      class="font-['Luckiest_Guy'] text-3xl md:text-4xl text-center mt-6 mb-6"
    >
      Config
    </h1>

    <div v-if="isLoading" class="flex justify-center py-12">
      <p class="text-(--color-text-muted)">Loading...</p>
    </div>

    <div v-else-if="!canEditAny" class="flex justify-center py-12">
      <p class="text-(--color-text-muted)">
        You don't have permission to edit config.
      </p>
    </div>

    <template v-else>
      <Panel
        v-for="category in visibleCategories"
        :key="category.id"
        class="mb-6"
      >
        <h2 class="font-['Luckiest_Guy'] text-xl mb-4 flex items-center gap-2">
          <Badge
            v-if="category.icon"
            :src="category.icon"
            :alt="category.label"
          />
          {{ category.label }}
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="field in category.fields" :key="field.key">
            <label
              :for="`config-${field.key}`"
              class="block font-semibold text-sm mb-1"
            >
              {{ field.label }}
            </label>
            <input
              :id="`config-${field.key}`"
              type="number"
              :step="field.step ?? 1"
              :value="formModel[field.key]"
              :disabled="isBusy"
              class="w-full px-3 py-2 rounded-(--radius-btn) bg-(--color-primary) text-(--color-text) border border-(--color-contrast) focus:outline-none focus:border-(--color-active)"
              @input="
                formModel[field.key] = Number(
                  ($event.target as HTMLInputElement).value,
                )
              "
            />
          </div>
        </div>
      </Panel>

      <div class="flex justify-between items-center mt-4">
        <div>
          <p v-if="submitError" class="text-(--color-danger) text-sm">
            {{ submitError }}
          </p>
          <p v-else-if="submitSuccess" class="text-green-400 text-sm">
            Config saved successfully.
          </p>
        </div>
        <Button :disabled="isBusy" @click="handleSave">Save</Button>
      </div>
    </template>
  </div>
</template>
