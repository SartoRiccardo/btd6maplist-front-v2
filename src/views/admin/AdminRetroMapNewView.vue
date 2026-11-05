<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ApiError } from "@/services/api/client";
import { parseApiErrors, type FormFieldError } from "@/services/api/formErrors";
import { toast } from "vue-sonner";
import { useCreateRetroMap } from "@/services/api/retro-maps/queries";
import Panel from "@/components/ui/Panel.vue";
import Button from "@/components/ui/Button.vue";
import RetroMapForm, {
  type RetroMapFormModel,
} from "@/components/retro-maps/RetroMapForm.vue";

const { t } = useI18n({ inheritLocale: true });

const router = useRouter();

const formModel = ref<RetroMapFormModel>({
  name: "",
  sort_order: 0,
  retro_game_id: null,
  preview_url: "",
  preview_file: null,
});

const formRef = ref<InstanceType<typeof RetroMapForm> | null>(null);
const apiErrors = ref<FormFieldError[]>([]);
const activeErrors = ref<FormFieldError[]>([]);
const isBusy = ref(false);

const createMutation = useCreateRetroMap();

async function handleSave() {
  if (!formRef.value) return;
  await formRef.value.touchAll();
  if (activeErrors.value.length > 0) return;

  isBusy.value = true;
  try {
    await createMutation.mutateAsync({
      name: formModel.value.name,
      sort_order: formModel.value.sort_order,
      retro_game_id: formModel.value.retro_game_id!,
      preview_url: formModel.value.preview_url || undefined,
      preview_file: formModel.value.preview_file ?? undefined,
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
</script>

<template>
  <div>
    <h1
      class="font-['Luckiest_Guy'] text-3xl md:text-4xl text-center mt-6 mb-4"
    >
      {{ t("title") }}
    </h1>

    <Panel>
      <RetroMapForm
        ref="formRef"
        v-model="formModel"
        :disabled="isBusy"
        :external-errors="apiErrors"
        @errors="activeErrors = $event"
      />
    </Panel>

    <div class="flex justify-between items-center mt-8">
      <Button @click="router.push('/admin/retro-maps')">{{ t("back") }}</Button>
      <Button :disabled="isBusy" @click="handleSave">{{ t("common.save") }}</Button>
    </div>
  </div>
</template>

<i18n lang="json">
{
  "en": {
    "title": "New Retro Map",
    "back": "← Back",
    "somethingWentWrong": "Something went wrong. Please try again.",
    "errorWithCode": "{message} (Error code: {code})"
  }
}
</i18n>
