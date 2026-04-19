<script setup lang="ts">
import { ref, watch } from "vue";
import { ApiError } from "@/services/api/client";
import { parseApiErrors, type FormFieldError } from "@/services/api/formErrors";
import { toast } from "vue-sonner";
import { useCreateUser } from "@/services/api/users/queries";
import Button from "@/components/ui/Button.vue";
import UserForm, { type UserFormModel } from "./UserForm.vue";

const emit = defineEmits<{
  created: [];
}>();

const open = ref(false);
const formModel = ref<UserFormModel>({ discord_id: "", name: "" });
const apiErrors = ref<FormFieldError[]>([]);
const activeErrors = ref<FormFieldError[]>([]);
const formRef = ref<InstanceType<typeof UserForm> | null>(null);

const createMutation = useCreateUser();
const busy = ref(false);

function openModal() {
  formModel.value = { discord_id: "", name: "" };
  apiErrors.value = [];
  open.value = true;
}

function close() {
  open.value = false;
}

async function handleSubmit() {
  if (!formRef.value) return;

  await formRef.value.touchAll();
  if (activeErrors.value.length > 0) return;

  busy.value = true;
  try {
    await createMutation.mutateAsync(formModel.value);
    close();
    emit("created");
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
  } finally {
    busy.value = false;
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") close();
}

watch(open, (isOpen) => {
  if (isOpen) document.addEventListener("keydown", onKeydown);
  else document.removeEventListener("keydown", onKeydown);
});

defineExpose({ open: openModal });
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center"
      @click="close"
    >
      <div class="absolute inset-0 bg-black/80" />
      <div
        class="relative bg-(--color-secondary) rounded-(--radius-panel) p-6 max-w-sm w-[90%]"
        @click.stop
      >
        <h2 class="font-bold text-lg mb-4">New User</h2>

        <UserForm
          ref="formRef"
          v-model="formModel"
          :disabled="busy"
          :external-errors="apiErrors"
          @errors="activeErrors = $event"
        />

        <div class="flex justify-end gap-2 mt-4">
          <Button :disabled="busy" @click="close">Cancel</Button>
          <Button :active="true" :disabled="busy" @click="handleSubmit">
            Submit
          </Button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
