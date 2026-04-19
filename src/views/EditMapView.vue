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
import {
  useMap,
  useUpdateMap,
  useDeleteMap,
} from "@/services/api/maps/queries";
import type { MapDetail } from "@/services/api/maps/types";
import type { User } from "@/services/api/users/types";
import Panel from "@/components/ui/Panel.vue";
import Button from "@/components/ui/Button.vue";
import MapForm from "@/components/maps/map-form/MapForm.vue";
import {
  type MapFormModel,
  type RemakeOfValue,
} from "@/components/maps/map-form/types";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const code = computed(() => route.params["code"] as string);

// --- Fetch map ---

const { data: mapDetail, isLoading, isError } = useMap(code);

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

// --- Transform API data → form model ---

function mapDetailToFormModel(map: MapDetail): MapFormModel {
  let remake_of: RemakeOfValue | null = null;
  if (map.retro_map) {
    remake_of = {
      game_id: map.retro_map.game.game_id,
      game_name: map.retro_map.game.game_name,
      map_id: map.retro_map.id,
      map_name: map.retro_map.name,
    };
  }

  return {
    name: map.name,
    map_preview_url: map.map_preview_url,
    custom_map_preview_file: null,
    r6_start: map.r6_start ?? "",
    r6_start_file: null,
    aliases: map.aliases,
    additional_codes: [],
    placement_curver: map.placement_curver,
    placement_allver: map.placement_allver,
    difficulty: map.difficulty,
    botb_difficulty: map.botb_difficulty,
    remake_of,
    optimal_heros: (map.optimal_heros ?? []).map((h) => h.toLowerCase()),
    creators: map.creators.map((c) => ({
      user_id: c.user_id,
      role: c.role,
    })),
    verifiers: map.verifications.map((v) => ({
      user_id: v.user_id,
      version: v.version != null ? (v.version / 10).toFixed(1) : "",
    })),
  };
}

const formModel = ref<MapFormModel | null>(null);
const initialCreatorUsers = ref<User[]>([]);
const initialVerifierUsers = ref<User[]>([]);

watch(
  mapDetail,
  (map) => {
    if (map && !formModel.value) {
      formModel.value = mapDetailToFormModel(map);
      initialCreatorUsers.value = map.creators.map((c) => c.user);
      initialVerifierUsers.value = map.verifications.map((v) => v.user);
    }
  },
  { immediate: true },
);

// --- Submission ---

const updateMutation = useUpdateMap();
const deleteMutation = useDeleteMap();
const formRef = ref<InstanceType<typeof MapForm> | null>(null);
const apiErrors = ref<FormFieldError[]>([]);
const activeErrors = ref<FormFieldError[]>([]);
const busy = computed(
  () => updateMutation.isPending.value || deleteMutation.isPending.value,
);

async function handleSave() {
  if (!formRef.value || !formModel.value) return;

  await formRef.value.touchAll();

  if (activeErrors.value.length > 0) return;

  try {
    await updateMutation.mutateAsync({
      code: code.value,
      data: {
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
      },
    });
    router.push(`/map/${code.value}`);
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

async function handleDelete() {
  if (!confirm("Are you sure you want to delete this map?")) return;

  try {
    await deleteMutation.mutateAsync(code.value);
    router.push("/");
  } catch {
    toast.error("Failed to delete map. Please try again.");
  }
}
</script>

<template>
  <div>
    <h1 class="font-['Luckiest_Guy'] text-3xl text-center mb-6">Edit Map</h1>

    <Panel v-if="isLoading" class="text-center py-8">
      <p class="text-(--color-text-muted)">Loading...</p>
    </Panel>

    <Panel v-else-if="isError" class="text-center py-8">
      <p class="text-(--color-danger)">Failed to load map.</p>
    </Panel>

    <Panel v-else-if="formModel">
      <MapForm
        ref="formRef"
        v-model="formModel"
        :disabled="busy"
        :external-errors="apiErrors"
        :editable-formats="editableFormats"
        :initial-creator-users="initialCreatorUsers"
        :initial-verifier-users="initialVerifierUsers"
        @errors="activeErrors = $event"
      />

      <div class="flex items-center mt-15">
        <router-link
          :to="`/map/${code}`"
          class="text-(--color-highlight) hover:underline"
        >
          Back to map
        </router-link>

        <div class="ml-auto flex gap-2">
          <Button
            :disabled="busy"
            class="bg-(--color-danger)! hover:bg-red-700!"
            @click="handleDelete"
          >
            Delete
          </Button>
          <Button :disabled="busy" @click="handleSave"> Save </Button>
        </div>
      </div>
    </Panel>
  </div>
</template>
