<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ApiError } from "@/services/api/client";
import { parseApiErrors, type FormFieldError } from "@/services/api/formErrors";
import { toast } from "vue-sonner";
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

const { t } = useI18n({ inheritLocale: true });

const route = useRoute();
const router = useRouter();

const id = Number(route.params["id"]);

const { data: retroMap, isLoading } = useRetroMap(id);

const formModel = ref<RetroMapFormModel>({
  name: "",
  sort_order: 0,
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
        sort_order: map.sort_order,
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

const updateMutation = useUpdateRetroMap();
const deleteMutation = useDeleteRetroMap();

const isBusy = ref(false);

async function handleSave() {
  if (!formRef.value || !retroMap.value) return;
  await formRef.value.touchAll();
  if (activeErrors.value.length > 0) return;

  isBusy.value = true;
  try {
    await updateMutation.mutateAsync({
      id,
      data: {
        name: formModel.value.name,
        sort_order: formModel.value.sort_order,
        retro_game_id: formModel.value.retro_game_id!,
        preview_url: formModel.value.preview_url,
        preview_file: formModel.value.preview_file ?? undefined,
      },
    });
    router.push("/admin/retro-maps");
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      const errorResult = parseApiErrors(error);
      apiErrors.value = errorResult.fieldErrors;
      await formRef.value.clearTouched();
      if (errorResult.fieldErrors.length === 0) {
        const message = errorResult.message || t("somethingWentWrong");
        toast.error(t("errorWithCode", { message, code: errorResult.status }));
      }
    } else {
      toast.error(t("somethingWentWrong"));
    }
  } finally {
    isBusy.value = false;
  }
}

async function handleDelete() {
  if (!(await deleteModal.value?.confirm())) return;
  isBusy.value = true;
  try {
    await deleteMutation.mutateAsync(id);
    router.push("/admin/retro-maps");
  } catch {
    toast.error(t("deleteFailed"));
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
      {{ t("title") }}
    </h1>

    <div v-if="isLoading" class="flex justify-center py-12">
      <p class="text-(--color-text-muted)">{{ t("common.loading") }}</p>
    </div>

    <Panel v-else-if="retroMap">
      <RetroMapForm
        ref="formRef"
        v-model="formModel"
        :disabled="isBusy"
        :external-errors="apiErrors"
        @errors="activeErrors = $event"
      />
    </Panel>

    <div class="flex justify-between items-center mt-4">
      <Button @click="router.push('/admin/retro-maps')">{{ t("back") }}</Button>
      <div class="flex gap-2">
        <Button danger :disabled="isBusy" @click="handleDelete">{{ t("common.delete") }}</Button>
        <Button :disabled="isBusy" @click="handleSave">{{ t("common.save") }}</Button>
      </div>
    </div>

    <ConfirmModal ref="deleteModal">
      <p class="text-center mb-0">
        {{ t("deleteConfirm") }}
      </p>
    </ConfirmModal>
  </div>
</template>

<i18n lang="json">
{
  "en": {
    "title": "Edit Retro Map",
    "back": "← Back",
    "deleteConfirm": "Delete this retro map? This cannot be undone.",
    "deleteFailed": "Failed to delete. Please try again.",
    "somethingWentWrong": "Something went wrong. Please try again.",
    "errorWithCode": "{message} (Error code: {code})"
  }
}
</i18n>
