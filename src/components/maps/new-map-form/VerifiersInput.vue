<script setup lang="ts">
import { ref, computed } from "vue";
import { useTouchedFields } from "@/composables/useTouchedFields";
import { useEmitOnChange } from "@/composables/useEmitOnChange";
import type { FormFieldError } from "@/services/api/formErrors";
import BoxedCheckbox from "@/components/ui/BoxedCheckbox.vue";
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
  }>(),
  { disabled: false, externalErrors: () => [] },
);

const emit = defineEmits<{
  "update:modelValue": [value: VerifierEntry[]];
  errors: [value: FormFieldError[]];
}>();

const { isTouched, touch } = useTouchedFields();

const selectedUsers = ref<Map<number, User | null>>(new Map());
const timelessMap = ref<Map<number, boolean>>(new Map());

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

function toggleTimeless(index: number, checked: boolean) {
  timelessMap.value = new Map(timelessMap.value).set(index, checked);
  touch(`verifiers.${index}.version`);
}

function onRemove(items: VerifierEntry[]) {
  selectedUsers.value = new Map();
  timelessMap.value = new Map();
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
    const isTimeless = timelessMap.value.get(i) ?? false;
    if (!isTimeless && v.version.trim() && isNaN(parseFloat(v.version))) {
      errors.push({
        path: `verifiers.${i}.version`,
        message: "Invalid version number.",
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

        <div class="flex items-start gap-2">
          <div>
            <input
              type="text"
              :value="modelValue[index]!.version"
              :disabled="disabled || timelessMap.get(index)"
              placeholder="e.g. 44.5"
              class="flex-1 sm:w-24 sm:flex-none px-3 py-2 rounded-(--radius-btn) bg-(--color-primary) text-(--color-text) border border-(--color-contrast) focus:outline-none focus:border-(--color-active)"
              :class="{
                'border-(--color-danger)!': fieldError(`verifiers.${index}.version`),
              }"
              @input="
                updateAt(index, {
                  version: ($event.target as HTMLInputElement).value,
                })
              "
            />
            <p
              v-if="fieldError(`verifiers.${index}.version`)"
              class="text-(--color-danger) text-xs mt-1"
            >
              {{ fieldError(`verifiers.${index}.version`) }}
            </p>
          </div>

          <div class="flex items-center">
            <BoxedCheckbox
              :model-value="timelessMap.get(index) ?? false"
              :disabled="disabled"
              label="Timeless"
              @update:model-value="toggleTimeless(index, $event)"
            />
          </div>
        </div>
      </div>
    </template>
  </ListEditor>
</template>
