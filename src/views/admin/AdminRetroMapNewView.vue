<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { ApiError } from "@/services/api/client";
import { parseApiErrors, type FormFieldError } from "@/services/api/formErrors";
import { useCreateRetroMap } from "@/services/api/retro-maps/queries";
import Panel from "@/components/ui/Panel.vue";
import Button from "@/components/ui/Button.vue";
import RetroMapForm, {
  type RetroMapFormModel,
} from "@/components/retro-maps/RetroMapForm.vue";

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
const submitError = ref<string | null>(null);
const isBusy = ref(false);

const createMutation = useCreateRetroMap();

async function handleSave() {
  if (!formRef.value) return;
  submitError.value = null;
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
</script>

<template>
  <div>
    <h1
      class="font-['Luckiest_Guy'] text-3xl md:text-4xl text-center mt-6 mb-4"
    >
      New Retro Map
    </h1>

    <Panel>
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

    <div class="flex justify-between items-center mt-8">
      <Button @click="router.push('/admin/retro-maps')">← Back</Button>
      <Button :disabled="isBusy" @click="handleSave">Save</Button>
    </div>
  </div>
</template>
