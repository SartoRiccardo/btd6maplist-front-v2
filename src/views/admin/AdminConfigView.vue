<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth";
import { useConfig, useUpdateConfig } from "@/services/api/config/queries";
import { ApiError } from "@/services/api/client";
import { toast } from "vue-sonner";
import { permissions } from "@/constants/permissions";
import {
  FORMAT_MAPLIST,
  FORMAT_EXPERT_LIST,
  FORMAT_ICONS,
} from "@/constants/formats";
import Panel from "@/components/ui/Panel.vue";
import Button from "@/components/ui/Button.vue";
import Badge from "@/components/common/Badge.vue";
import { MARKDOWN_ICONS } from "@/utils/markdownIcons";

const { t } = useI18n({ inheritLocale: true });

interface ConfigFieldDef {
  key: string;
  label: string;
  icon?: string;
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
  label: t("categories.maplist"),
  icon: FORMAT_ICONS.find((f) => f.id === FORMAT_MAPLIST)?.image,
  fields: [
    { key: "points_top_map", label: t("fields.pointsTopMap") },
    { key: "points_bottom_map", label: t("fields.pointsBottomMap") },
    { key: "formula_slope", label: t("fields.formulaSlope"), step: 0.001 },
    { key: "points_extra_lcc", label: t("fields.lccBonusPoints"), icon: "lcc" },
    {
      key: "points_multi_gerry",
      label: t("fields.noOptimalHeroMultiplier"),
      icon: "no_optimal_hero",
    },
    {
      key: "points_multi_bb",
      label: t("fields.blackBorderMultiplier"),
      icon: "black_border",
    },
    { key: "decimal_digits", label: t("fields.decimalDigits") },
    { key: "map_count", label: t("fields.mapCount") },
  ],
};

const EXPERT_CATEGORY: ConfigCategoryDef = {
  id: "expert_list",
  label: t("categories.expertList"),
  icon: FORMAT_ICONS.find((f) => f.id === FORMAT_EXPERT_LIST)?.image,
  fields: [
    { key: "exp_points_casual", label: t("fields.casualExpertPoints") },
    { key: "exp_points_medium", label: t("fields.mediumExpertPoints") },
    { key: "exp_points_high", label: t("fields.highExpertPoints") },
    { key: "exp_points_true", label: t("fields.trueExpertPoints") },
    { key: "exp_points_extreme", label: t("fields.extremeExpertPoints") },
    {
      key: "exp_nogerry_points_casual",
      label: t("fields.casualExpertNoOptimalHeroPoints"),
      icon: "no_optimal_hero",
    },
    {
      key: "exp_nogerry_points_medium",
      label: t("fields.mediumExpertNoOptimalHeroPoints"),
      icon: "no_optimal_hero",
    },
    {
      key: "exp_nogerry_points_high",
      label: t("fields.highExpertNoOptimalHeroPoints"),
      icon: "no_optimal_hero",
    },
    {
      key: "exp_nogerry_points_true",
      label: t("fields.trueExpertNoOptimalHeroPoints"),
      icon: "no_optimal_hero",
    },
    {
      key: "exp_nogerry_points_extreme",
      label: t("fields.extremeExpertNoOptimalHeroPoints"),
      icon: "no_optimal_hero",
    },
    {
      key: "exp_bb_multi",
      label: t("fields.blackBorderMultiplier"),
      icon: "black_border",
    },
    { key: "exp_lcc_extra", label: t("fields.lccExtraPoints"), icon: "lcc" },
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
      const raw = cfg as unknown as Record<string, number>;
      formModel.value = {
        ...raw,
        current_btd6_ver: raw["current_btd6_ver"]! / 10,
      };
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
  label: t("categories.miscellaneous"),
  fields: [
    { key: "current_btd6_ver", label: t("fields.currentBtd6Version"), step: 0.1 },
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

async function handleSave() {
  isBusy.value = true;
  try {
    await saveConfig({
      ...formModel.value,
      current_btd6_ver: Math.round(formModel.value["current_btd6_ver"]! * 10),
    } as never);
    toast.success(t("configSaved"));
  } catch (error: unknown) {
    toast.error(
      error instanceof ApiError
        ? t("configSaveFailed")
        : t("somethingWentWrong"),
    );
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
      {{ t("title") }}
    </h1>

    <div v-if="isLoading" class="flex justify-center py-12">
      <p class="text-(--color-text-muted)">{{ t("common.loading") }}</p>
    </div>

    <div v-else-if="!canEditAny" class="flex justify-center py-12">
      <p class="text-(--color-text-muted)">
        {{ t("noPermission") }}
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
              class="flex items-center gap-1 font-semibold text-sm mb-1"
            >
              <img
                v-if="field.icon"
                :src="MARKDOWN_ICONS[field.icon]"
                :alt="field.icon"
                class="inline-block h-[1.2em] w-[1.2em] object-cover"
              />
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

      <div class="flex justify-end mt-4">
        <Button :disabled="isBusy" @click="handleSave">{{ t("common.save") }}</Button>
      </div>
    </template>
  </div>
</template>

<i18n lang="json">
{
  "en": {
    "title": "Config",
    "noPermission": "You don't have permission to edit config.",
    "configSaved": "Config saved successfully.",
    "configSaveFailed": "Failed to save config. Please try again.",
    "somethingWentWrong": "Something went wrong. Please try again.",
    "categories": {
      "maplist": "Maplist",
      "expertList": "Expert List",
      "miscellaneous": "Miscellaneous"
    },
    "fields": {
      "pointsTopMap": "Points (Top Map)",
      "pointsBottomMap": "Points (Bottom Map)",
      "formulaSlope": "Formula Slope",
      "lccBonusPoints": "LCC Bonus Points",
      "noOptimalHeroMultiplier": "No Optimal Hero Multiplier",
      "blackBorderMultiplier": "Black Border Multiplier",
      "decimalDigits": "Decimal Digits",
      "mapCount": "Map Count",
      "casualExpertPoints": "Casual Expert Points",
      "mediumExpertPoints": "Medium Expert Points",
      "highExpertPoints": "High Expert Points",
      "trueExpertPoints": "True Expert Points",
      "extremeExpertPoints": "Extreme Expert Points",
      "casualExpertNoOptimalHeroPoints": "Casual Expert No Optimal Hero Points",
      "mediumExpertNoOptimalHeroPoints": "Medium Expert No Optimal Hero Points",
      "highExpertNoOptimalHeroPoints": "High Expert No Optimal Hero Points",
      "trueExpertNoOptimalHeroPoints": "True Expert No Optimal Hero Points",
      "extremeExpertNoOptimalHeroPoints": "Extreme Expert No Optimal Hero Points",
      "lccExtraPoints": "LCC Extra Points",
      "currentBtd6Version": "Current BTD6 Version"
    }
  }
}
</i18n>
