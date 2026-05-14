<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useFormatWithWebhooks, useUpdateFormat } from "@/services/api/formats/queries";
import { permissions } from "@/constants/permissions";
import { ApiError } from "@/services/api/client";
import { parseApiErrors } from "@/services/api/formErrors";
import type { FormFieldError } from "@/services/api/formErrors";
import { toast } from "vue-sonner";
import Panel from "@/components/ui/Panel.vue";
import Button from "@/components/ui/Button.vue";
import FormatPresentationForm, {
  type FormatPresentationFormModel,
} from "@/components/formats/FormatPresentationForm.vue";
import FormatPresentationFormSkeleton from "@/components/formats/FormatPresentationFormSkeleton.vue";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const id = Number(route.params["id"]);
const canEdit = computed(() =>
  auth.hasPermission(permissions.formatPresentation.edit, id),
);

const { data: format, isLoading } = useFormatWithWebhooks(id);
const { mutateAsync: saveFormat } = useUpdateFormat();

const formModel = ref<FormatPresentationFormModel>({
  name: "",
  slug: "",
  hidden: false,
  map_submission_status: "closed",
  run_submission_status: "closed",
  is_lcc_leaderboard_enabled: false,
  is_no_geraldo_leaderboard_enabled: false,
  is_black_border_leaderboard_enabled: false,
  button_text: "",
  discord_server_url: "",
  description: "",
  preview_map_1_code: "",
  preview_map_2_code: "",
  preview_map_3_code: "",
  map_submission_rules: "",
  completion_submission_rules: "",
  map_submission_wh: "",
  run_submission_wh: "",
});

let formInitialized = false;

watch(
  () => format.value,
  (fmt) => {
    if (fmt && !formInitialized) {
      formInitialized = true;
      formModel.value = {
        name: fmt.name,
        slug: fmt.slug ?? "",
        hidden: fmt.hidden,
        map_submission_status: fmt.map_submission_status,
        run_submission_status: fmt.run_submission_status,
        is_lcc_leaderboard_enabled: fmt.is_lcc_leaderboard_enabled,
        is_no_geraldo_leaderboard_enabled: fmt.is_no_geraldo_leaderboard_enabled,
        is_black_border_leaderboard_enabled:
          fmt.is_black_border_leaderboard_enabled,
        button_text: fmt.button_text ?? "",
        discord_server_url: fmt.discord_server_url ?? "",
        description: fmt.description ?? "",
        preview_map_1_code: fmt.preview_map1?.code ?? "",
        preview_map_2_code: fmt.preview_map2?.code ?? "",
        preview_map_3_code: fmt.preview_map3?.code ?? "",
        map_submission_rules: fmt.map_submission_rules ?? "",
        completion_submission_rules: fmt.completion_submission_rules ?? "",
        map_submission_wh: fmt.map_submission_wh ?? "",
        run_submission_wh: fmt.run_submission_wh ?? "",
      };
    }
  },
  { immediate: true },
);

const formRef = ref<InstanceType<typeof FormatPresentationForm> | null>(null);
const apiErrors = ref<FormFieldError[]>([]);
const activeErrors = ref<FormFieldError[]>([]);
const isBusy = ref(false);

async function handleSave() {
  if (!formRef.value || !format.value) return;
  await formRef.value.touchAll();
  if (activeErrors.value.length > 0) {
    toast.error("Please fix the errors before saving.");
    return;
  }

  isBusy.value = true;
  try {
    await saveFormat({
      id,
      data: {
        name: formModel.value.name,
        hidden: formModel.value.hidden,
        run_submission_status: formModel.value.run_submission_status,
        map_submission_status: formModel.value.map_submission_status,
        slug: formModel.value.slug || null,
        description: formModel.value.description || null,
        button_text: formModel.value.button_text || null,
        preview_map_1_code: formModel.value.preview_map_1_code || null,
        preview_map_2_code: formModel.value.preview_map_2_code || null,
        preview_map_3_code: formModel.value.preview_map_3_code || null,
        is_lcc_leaderboard_enabled: formModel.value.is_lcc_leaderboard_enabled,
        is_no_geraldo_leaderboard_enabled:
          formModel.value.is_no_geraldo_leaderboard_enabled,
        is_black_border_leaderboard_enabled:
          formModel.value.is_black_border_leaderboard_enabled,
        map_submission_rules: formModel.value.map_submission_rules || null,
        completion_submission_rules:
          formModel.value.completion_submission_rules || null,
        discord_server_url: formModel.value.discord_server_url || null,
        map_submission_wh: formModel.value.map_submission_wh || null,
        run_submission_wh: formModel.value.run_submission_wh || null,
      },
    });
    toast.success("Saved successfully.");
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      const errorResult = parseApiErrors(error);
      apiErrors.value = errorResult.fieldErrors;
      await formRef.value.clearTouched();
      if (errorResult.fieldErrors.length > 0) {
        toast.error("Please fix the errors before saving.");
      } else {
        const message = errorResult.message || "Something went wrong. Please try again.";
        toast.error(`${message} (Error code: ${errorResult.status})`);
      }
    } else {
      toast.error("Something went wrong. Please try again.");
    }
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
      {{ format ? format.name : "List Info" }}
    </h1>

    <Panel v-if="isLoading">
      <FormatPresentationFormSkeleton />
    </Panel>

    <div v-else-if="!canEdit" class="flex justify-center py-12">
      <p class="text-(--color-text-muted)">
        You don't have permission to edit this list.
      </p>
    </div>

    <Panel v-else-if="format">
      <FormatPresentationForm
        ref="formRef"
        v-model="formModel"
        :format-id="id"
        :initial-maps="[
          format.preview_map1,
          format.preview_map2,
          format.preview_map3,
        ]"
        :disabled="isBusy"
        :external-errors="apiErrors"
        @errors="activeErrors = $event"
      />
    </Panel>

    <div class="flex justify-between items-center mt-4">
      <Button @click="router.push('/admin/lists')">← Back</Button>
      <Button v-if="canEdit && format" :disabled="isBusy" @click="handleSave"
        >Save</Button
      >
    </div>
  </div>
</template>
