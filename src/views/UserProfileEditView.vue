<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useUpdateCurrentUser } from "@/services/api/users/queries";
import { ApiError } from "@/services/api/client";
import { parseApiErrors, type FormFieldError } from "@/services/api/formErrors";
import { toast } from "vue-sonner";
import ProfileForm, {
  type ProfileFormModel,
} from "@/components/users/ProfileForm.vue";
import Panel from "@/components/ui/Panel.vue";
import Button from "@/components/ui/Button.vue";
import LinkButton from "@/components/ui/LinkButton.vue";

const oakGuideOpen = ref(false);

const router = useRouter();
const auth = useAuthStore();
const updateMutation = useUpdateCurrentUser(
  computed(() => auth.user?.discord_id),
);

const formRef = ref<InstanceType<typeof ProfileForm> | null>(null);
const apiErrors = ref<FormFieldError[]>([]);
const activeErrors = ref<FormFieldError[]>([]);
const busy = computed(() => updateMutation.isPending.value || auth.isFetching);

const formModel = ref<ProfileFormModel>({
  name: auth.user?.name ?? "",
  nk_oak: "",
});

const profileUrl = computed(() =>
  auth.user ? `/users/${auth.user.discord_id}` : "/",
);

async function handleSave() {
  if (!formRef.value) return;

  await formRef.value.touchAll();

  if (activeErrors.value.length > 0) return;

  try {
    await updateMutation.mutateAsync({
      name: formModel.value.name,
      nk_oak: formModel.value.nk_oak || null,
    });
    router.push(profileUrl.value);
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
    <h1 class="font-['Luckiest_Guy'] text-3xl text-center mb-6">
      Edit Profile
    </h1>

    <Panel>
      <ProfileForm
        ref="formRef"
        v-model="formModel"
        :disabled="busy"
        :external-errors="apiErrors"
        @errors="activeErrors = $event"
      />

      <div class="flex justify-end gap-2 mt-6">
        <LinkButton :to="profileUrl" :disabled="busy">Cancel</LinkButton>
        <Button :disabled="busy" @click="handleSave"> Save </Button>
      </div>

      <div class="pt-6">
        <p class="text-(--color-text-muted) text-center mb-3">
          <a
            href="https://support.ninjakiwi.com/hc/en-us/articles/13438499873937-Open-Data-API"
            target="_blank"
            class="inline-flex items-center gap-1"
          >
            NinjaKiwi OAKs <i class="bi bi-box-arrow-up-right" />
          </a>
          (OpenData API Keys) are used to give you your in-game profile picture
          and banner. You can generate one inside of BTD6 very easily.
          <br />
          They expire after 90 days of not being used, so if you haven't been
          here for a while, chances are you need to generate a new one!
        </p>

        <div class="flex justify-center mb-3">
          <Button @click="oakGuideOpen = !oakGuideOpen">
            {{ oakGuideOpen ? "Hide guide" : "How do I get mine?" }}
          </Button>
        </div>

        <div v-if="oakGuideOpen" class="flex flex-col items-center gap-4">
          <p class="text-center">
            Open BTD6 and go into the settings, then click <b><u>Account</u></b>
          </p>
          <img
            src="https://i.imgur.com/FurlzfB.png"
            class="max-w-sm w-full rounded-(--radius-panel)"
          />

          <p class="text-center">
            Click <b><u>Open Data API</u></b> on the bottom right
          </p>
          <img
            src="https://i.imgur.com/tCqlDYj.png"
            class="max-w-sm w-full rounded-(--radius-panel)"
          />

          <p class="text-center">
            Click <b><u>Generate New Key</u></b> and then you can copy it and
            you're done!
          </p>
          <img
            src="https://i.imgur.com/owhXl4U.png"
            class="max-w-sm w-full rounded-(--radius-panel)"
          />
        </div>
      </div>
    </Panel>
  </div>
</template>
