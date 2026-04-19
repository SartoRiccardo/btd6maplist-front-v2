<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ApiError } from "@/services/api/client";
import { parseApiErrors, type FormFieldError } from "@/services/api/formErrors";
import {
  useRetroMap,
  useUpdateRetroMap,
  useDeleteRetroMap,
} from "@/services/api/retro-maps/queries";
import Panel from "@/components/ui/Panel.vue";
import Button from "@/components/ui/Button.vue";
import ConfirmModal from "@/components/common/ConfirmModal.vue";
import RetroMapForm, {
  type RetroMapFormModel,
} from "@/components/retro-maps/RetroMapForm.vue";

const route = useRoute();
const router = useRouter();

const id = Number(route.params["id"]);

const { data: retroMap, isLoading } = useRetroMap(id);

const formModel = ref<RetroMapFormModel>({
  name: "",
  retro_game_id: null,
  preview_url: "",
  preview_file: null,
});

let formInitialized = false;

watch(
  () => retroMap.value,
  (map) => {
    if (map && !formInitialized) {
      formInitialized = true;
      formModel.value = {
        name: map.name,
        retro_game_id: map.retro_game_id,
        preview_url: map.preview_url,
        preview_file: null,
      };
    }
  },
  { immediate: true },
);

const formRef = ref<InstanceType<typeof RetroMapForm> | null>(null);
const deleteModal = ref<InstanceType<typeof ConfirmModal> | null>(null);
const apiErrors = ref<FormFieldError[]>([]);
const activeErrors = ref<FormFieldError[]>([]);
const submitError = ref<string | null>(null);

const updateMutation = useUpdateRetroMap();
const deleteMutation = useDeleteRetroMap();

const isBusy = ref(false);

async function handleSave() {
  if (!formRef.value || !retroMap.value) return;
  submitError.value = null;
  await formRef.value.touchAll();
  if (activeErrors.value.length > 0) return;

  isBusy.value = true;
  try {
    await updateMutation.mutateAsync({
      id,
      data: {
        name: formModel.value.name,
        sort_order: retroMap.value.sort_order,
        retro_game_id: formModel.value.retro_game_id!,
        preview_url: formModel.value.preview_url,
        preview_file: formModel.value.preview_file ?? undefined,
      },
    });
    router.push("/admin/retro-maps");
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      apiErrors.value = parseApiErrors(error);
      await formRef.value.clearTouched();
      if (apiErrors.value.length === 0) {
        submitError.value = "Something went wrong. Please try again.";
      }
    } else {
      submitError.value = "Something went wrong. Please try again.";
    }
  } finally {
    isBusy.value = false;
  }
}

async function handleDelete() {
  if (!await deleteModal.value?.confirm()) return;
  isBusy.value = true;
  try {
    await deleteMutation.mutateAsync(id);
    router.push("/admin/retro-maps");
  } catch {
    submitError.value = "Failed to delete. Please try again.";
  } finally {
    isBusy.value = false;
  }
}
</script>

<template>
  <div>
    <h1
      class="font-['Luckiest_Guy'] text-3xl md:text-4xl text-center mt-6 mb-4"
    >
      Edit Retro Map
    </h1>

    <div v-if="isLoading" class="flex justify-center py-12">
      <p class="text-(--color-text-muted)">Loading...</p>
    </div>

    <Panel v-else-if="retroMap">
      <RetroMapForm
        ref="formRef"
        v-model="formModel"
        :disabled="isBusy"
        :external-errors="apiErrors"
        @errors="activeErrors = $event"
      />

      <p v-if="submitError" class="text-(--color-danger) text-sm mt-4">
        {{ submitError }}
      </p>
    </Panel>

    <div class="flex justify-between items-center mt-4">
      <Button @click="router.push('/admin/retro-maps')">← Back</Button>
      <div class="flex gap-2">
        <Button danger :disabled="isBusy" @click="handleDelete">Delete</Button>
        <Button :disabled="isBusy" @click="handleSave">Save</Button>
      </div>
    </div>

    <ConfirmModal ref="deleteModal">
      <p class="text-center mb-0">
        Delete this retro map? This cannot be undone.
      </p>
    </ConfirmModal>
  </div>
</template>
