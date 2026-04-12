<script setup lang="ts">
import { ref, computed } from "vue";
import { useTouchedFields } from "@/composables/useTouchedFields";
import { useEmitOnChange } from "@/composables/useEmitOnChange";
import type { FormFieldError } from "@/services/api/formErrors";
import { useConfig } from "@/services/api/config/queries";
import AsyncSelect from "@/components/ui/AsyncSelect.vue";
import ListEditor from "@/components/ui/ListEditor.vue";
import { search } from "@/services/api/search";
import type { User } from "@/services/api/users/types";
import type { VerifierEntry } from "./types";

const props = withDefaults(
  defineProps<{
    modelValue: VerifierEntry[];
    disabled?: boolean;
    externalErrors?: FormFieldError[];
    initialUsers?: User[];
  }>(),
  { disabled: false, externalErrors: () => [], initialUsers: () => [] },
);

const emit = defineEmits<{
  "update:modelValue": [value: VerifierEntry[]];
  errors: [value: FormFieldError[]];
}>();

const { isTouched, touch } = useTouchedFields();

const { data: config } = useConfig();

const currentVersion = computed(() => {
  if (!config.value) return null;
  return (config.value.current_btd6_ver / 10).toFixed(1);
});

const selectedUsers = ref<Map<number, User | null>>(
  new Map(props.initialUsers.map((u, i) => [i, u])),
);

function updateAt(index: number, partial: Partial<VerifierEntry>) {
  for (const key of Object.keys(partial)) touch(`verifiers.${index}.${key}`);
  const next = [...props.modelValue];
  next[index] = { ...next[index]!, ...partial };
  emit("update:modelValue", next);
}

function onUserSelect(index: number, user: User | null) {
  selectedUsers.value = new Map(selectedUsers.value).set(index, user);
  updateAt(index, { user_id: user?.discord_id ?? null });
}

function onVersionChange(index: number, value: string) {
  if (value === "current" && currentVersion.value) {
    updateAt(index, { version: currentVersion.value });
  } else {
    updateAt(index, { version: "" });
  }
}

function versionSelectValue(version: string): string {
  if (!version.trim()) return "alltime";
  if (version === currentVersion.value) return "current";
  return "alltime";
}

function onRemove(items: VerifierEntry[]) {
  selectedUsers.value = new Map();
  emit("update:modelValue", items);
}

async function searchUsers(query: string): Promise<User[]> {
  const results = await search({ q: query, entities: ["users"], limit: 10 });
  return results.filter((r) => r.type === "user").map((r) => r.result);
}

// --- Validation ---

const ownErrors = computed<FormFieldError[]>(() => {
  const errors: FormFieldError[] = [];
  for (let i = 0; i < props.modelValue.length; i++) {
    const v = props.modelValue[i]!;
    if (!v.user_id) {
      errors.push({
        path: `verifiers.${i}.user_id`,
        message: "A verifier must be selected.",
        source: "validation",
      });
    }
  }
  return errors;
});

const activeErrors = computed<FormFieldError[]>(() => {
  const validation = ownErrors.value.filter((e) => isTouched(e.path));
  const externalValidation = (props.externalErrors ?? []).filter(
    (e) => e.source === "validation" && isTouched(e.path),
  );
  const externalApi = (props.externalErrors ?? []).filter(
    (e) => e.source === "api" && !isTouched(e.path),
  );
  return [...validation, ...externalValidation, ...externalApi];
});

useEmitOnChange(activeErrors, (errors) => emit("errors", errors));

function fieldError(field: string): string | undefined {
  return activeErrors.value.find((e) => e.path === field)?.message;
}
</script>

<template>
  <ListEditor
    :model-value="modelValue"
    :default="{ user_id: null, version: '' } as VerifierEntry"
    :disabled="disabled"
    :min-items="1"
    add-label="Add Verifier"
    @update:model-value="onRemove"
  >
    <template #item="{ index }">
      <div class="flex flex-col sm:flex-row items-stretch sm:items-start gap-2">
        <div class="flex-1">
          <AsyncSelect
            :model-value="selectedUsers.get(index) ?? null"
            :search-fn="searchUsers"
            :display-value="(u: User) => u.name"
            :disabled="disabled"
            placeholder="Search users..."
            :min-chars="3"
            @update:model-value="onUserSelect(index, $event)"
          />
          <p
            v-if="fieldError(`verifiers.${index}.user_id`)"
            class="text-(--color-danger) text-xs mt-1"
          >
            {{ fieldError(`verifiers.${index}.user_id`) }}
          </p>
        </div>

        <select
          :value="versionSelectValue(modelValue[index]!.version)"
          :disabled="disabled"
          class="flex-1 sm:w-36 sm:flex-none px-3 py-2 rounded-(--radius-btn) bg-(--color-primary) text-(--color-text) border border-(--color-contrast) focus:outline-none focus:border-(--color-active)"
          :class="{
            'border-(--color-danger)!': fieldError(`verifiers.${index}.version`),
          }"
          @change="
            onVersionChange(
              index,
              ($event.target as HTMLSelectElement).value,
            )
          "
        >
          <option value="alltime">All Time</option>
          <option v-if="currentVersion" value="current">
            Current Version ({{ currentVersion }})
          </option>
        </select>
      </div>
    </template>
  </ListEditor>
</template>
