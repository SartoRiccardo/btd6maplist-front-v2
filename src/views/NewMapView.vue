<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import {
  FORMAT_MAPLIST,
  FORMAT_MAPLIST_ALL_VER,
  FORMAT_EXPERT_LIST,
  FORMAT_BEST_OF_THE_BEST,
  FORMAT_NOSTALGIA_PACK,
} from "@/constants/formats";
import { permissions } from "@/constants/permissions";
import { ApiError } from "@/services/api/client";
import { parseApiErrors, type FormFieldError } from "@/services/api/formErrors";
import { toast } from "vue-sonner";
import { useCreateMap } from "@/services/api/maps/queries";
import Panel from "@/components/ui/Panel.vue";
import Button from "@/components/ui/Button.vue";
import MapCodeInput, {
  type MapCodeValidation,
} from "@/components/maps/MapCodeInput.vue";
import MapForm from "@/components/maps/map-form/MapForm.vue";
import {
  createDefaultFormModel,
  type MapFormModel,
} from "@/components/maps/map-form/types";
import type { User } from "@/services/api/users/types";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

// --- Query params ---

const codeInput = ref(
  typeof route.query["code"] === "string" ? route.query["code"] : "",
);

const prefilledCreatorId = computed(() => {
  const val = route.query["creator_id"];
  return typeof val === "string" ? val : null;
});

const prefilledCreatorName = computed(() => {
  const val = route.query["creator_name"];
  return typeof val === "string" ? val : null;
});

const prefilledDifficulty = computed(() => {
  const val = route.query["proposed_difficulty"];
  return val ? Number(val) : null;
});

const prefilledFormat = computed(() => {
  const val = route.query["format"];
  return val ? Number(val) : null;
});

// --- Map code validation ---

const validation = ref<MapCodeValidation>({
  nkMap: null,
  nkError: null,
  nkLoading: false,
  maplistMap: null,
  maplistLoading: false,
  isCodeValid: false,
});

const nkMap = computed(() => validation.value.nkMap);
const maplistMap = computed(() => validation.value.maplistMap);
const isCodeValid = computed(() => validation.value.isCodeValid);
const isDataReady = computed(
  () => isCodeValid.value && !validation.value.maplistLoading,
);
const alreadyExists = computed(
  () => isDataReady.value && maplistMap.value != null,
);

// --- Editable formats ---

const ALL_FORMATS = [
  FORMAT_MAPLIST,
  FORMAT_MAPLIST_ALL_VER,
  FORMAT_EXPERT_LIST,
  FORMAT_BEST_OF_THE_BEST,
  FORMAT_NOSTALGIA_PACK,
];

const editableFormats = computed(() =>
  ALL_FORMATS.filter((id) => auth.hasPermission(permissions.map.edit, id)),
);

// --- Form state ---

const formModel = ref<MapFormModel>(createDefaultFormModel());
const initialCreatorUsers = ref<User[]>([]);

// Prefill name from NK map data
watch(
  () => validation.value.nkMap,
  (map) => {
    if (map) {
      formModel.value = {
        ...formModel.value,
        name: map.name,
        map_preview_url: map.mapURL,
      };
    }
  },
);

// Prefill creator from query param
watch(
  [prefilledCreatorId, prefilledCreatorName],
  ([discord_id, name]) => {
    if (discord_id && name) {
      formModel.value = {
        ...formModel.value,
        creators: [{ user_id: discord_id, role: null }],
      };
      initialCreatorUsers.value = [
        { discord_id, name, is_banned: false, roles: [] },
      ];
    } else {
      initialCreatorUsers.value = [];
    }
  },
  { immediate: true },
);

// Prefill difficulty from query param
watch(
  [prefilledDifficulty, prefilledFormat],
  ([diff, fmt]) => {
    if (diff == null || fmt == null) return;
    if (fmt === FORMAT_EXPERT_LIST) {
      formModel.value = { ...formModel.value, difficulty: diff };
    } else if (fmt === FORMAT_BEST_OF_THE_BEST) {
      formModel.value = { ...formModel.value, botb_difficulty: diff };
    }
  },
  { immediate: true },
);

// --- Submission ---

const createMutation = useCreateMap();
const formRef = ref<InstanceType<typeof MapForm> | null>(null);
const apiErrors = ref<FormFieldError[]>([]);
const activeErrors = ref<FormFieldError[]>([]);
const busy = computed(() => createMutation.isPending.value);

async function handleSubmit() {
  if (!formRef.value) return;

  await formRef.value.touchAll();

  if (activeErrors.value.length > 0) return;

  try {
    const result = await createMutation.mutateAsync({
      code: codeInput.value.trim().toUpperCase(),
      name: formModel.value.name,
      r6_start: formModel.value.r6_start || undefined,
      r6_start_file: formModel.value.r6_start_file ?? undefined,
      map_preview_url: formModel.value.map_preview_url || undefined,
      custom_map_preview_file:
        formModel.value.custom_map_preview_file ?? undefined,
      placement_curver: formModel.value.placement_curver ?? undefined,
      placement_allver: formModel.value.placement_allver ?? undefined,
      difficulty: formModel.value.difficulty ?? undefined,
      botb_difficulty: formModel.value.botb_difficulty ?? undefined,
      remake_of: formModel.value.remake_of?.map_id ?? undefined,
      optimal_heros:
        formModel.value.optimal_heros.length > 0
          ? formModel.value.optimal_heros
          : undefined,
      creators: formModel.value.creators
        .filter((c) => c.user_id)
        .map((c) => ({ user_id: c.user_id!, role: c.role })),
      verifiers: formModel.value.verifiers
        .filter((v) => v.user_id)
        .map((v) => ({
          user_id: v.user_id!,
          version: v.version.trim()
            ? Math.round(parseFloat(v.version) * 10)
            : null,
        })),
      aliases: formModel.value.aliases.filter((a) => a.trim()),
    });
    router.push(`/map/${result.code}`);
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      apiErrors.value = parseApiErrors(error);
      await formRef.value.clearTouched();
      if (apiErrors.value.length === 0) {
        toast.error("Something went wrong. Please try again.");
      }
    } else {
      toast.error("Something went wrong. Please try again.");
    }
  }
}
</script>

<template>
  <div>
    <h1 class="font-['Luckiest_Guy'] text-3xl text-center mb-6">New Map</h1>

    <!-- Map Code + Preview row -->
    <div
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 items-stretch"
    >
      <!-- Left: Code input panel -->
      <Panel class="sm:col-span-1 lg:col-span-2 flex flex-col">
        <MapCodeInput
          v-model="codeInput"
          :disabled="busy"
          @validation="validation = $event"
        />
      </Panel>

      <!-- Right: Map preview -->
      <div>
        <div
          v-if="nkMap"
          class="relative p-[0.4rem] pb-4 rounded-(--radius-panel) shadow-md bg-(--color-secondary)"
        >
          <p
            class="absolute top-[-0.7rem] left-[-0.1rem] w-full text-center font-['Luckiest_Guy'] font-border text-base md:text-2xl break-words z-10"
          >
            {{ nkMap.name }}
          </p>
          <img
            class="w-full h-auto aspect-[3/2] bg-(--color-primary) block rounded-sm"
            :src="nkMap.mapURL"
            alt=""
          />
        </div>
        <div
          v-else
          class="p-[0.4rem] pb-4 rounded-(--radius-panel) shadow-md bg-(--color-secondary)"
        >
          <div
            class="w-full aspect-[3/2] bg-(--color-primary) rounded-sm animate-pulse"
          />
        </div>
      </div>
    </div>

    <!-- Map already exists -->
    <Panel v-if="alreadyExists" class="text-center py-8">
      <p class="text-lg font-bold mb-3">This map already exists!</p>
      <router-link
        :to="`/map/${maplistMap!.code}/edit`"
        class="text-(--color-highlight) hover:underline"
      >
        Edit {{ maplistMap!.name }}
      </router-link>
    </Panel>

    <!-- Form (shown when code is valid, data is ready, and map doesn't exist) -->
    <Panel v-else-if="isDataReady">
      <MapForm
        ref="formRef"
        v-model="formModel"
        :disabled="busy"
        :external-errors="apiErrors"
        :editable-formats="editableFormats"
        :initial-creator-users="initialCreatorUsers"
        :initial-format="prefilledFormat ?? undefined"
        :initial-format-placement="prefilledDifficulty ?? undefined"
        @errors="activeErrors = $event"
      />

      <div class="flex justify-end gap-2 mt-15">
        <Button :disabled="busy" @click="handleSubmit"> Create Map </Button>
      </div>
    </Panel>
  </div>
</template>
