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
import type { CreatorEntry } from "./types";

const props = withDefaults(
  defineProps<{
    modelValue: CreatorEntry[];
    disabled?: boolean;
    externalErrors?: FormFieldError[];
    initialUsers?: User[];
  }>(),
  { disabled: false, externalErrors: () => [], initialUsers: () => [] },
);

const emit = defineEmits<{
  "update:modelValue": [value: CreatorEntry[]];
  errors: [value: FormFieldError[]];
}>();

const { isTouched, touch } = useTouchedFields();

const creatorsUnknown = ref(props.modelValue.length === 0);
let cachedCreators: CreatorEntry[] = [];
let cachedUsers = new Map<number, User | null>();

function toggleUnknown(checked: boolean) {
  creatorsUnknown.value = checked;
  if (checked) {
    cachedCreators = [...props.modelValue];
    cachedUsers = new Map(selectedUsers.value);
    emit("update:modelValue", []);
  } else {
    selectedUsers.value = new Map(cachedUsers);
    emit(
      "update:modelValue",
      cachedCreators.length > 0
        ? [...cachedCreators]
        : [{ user_id: null, role: null }],
    );
  }
}

const selectedUsers = ref<Map<number, User | null>>(
  new Map(props.initialUsers.map((u, i) => [i, u])),
);

function updateAt(index: number, partial: Partial<CreatorEntry>) {
  for (const key of Object.keys(partial)) touch(`creators.${index}.${key}`);
  const next = [...props.modelValue];
  next[index] = { ...next[index]!, ...partial };
  emit("update:modelValue", next);
}

function onUserSelect(index: number, user: User | null) {
  selectedUsers.value = new Map(selectedUsers.value).set(index, user);
  updateAt(index, { user_id: user?.discord_id ?? null });
}

function onRemove(items: CreatorEntry[]) {
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
    const c = props.modelValue[i]!;
    if (!c.user_id) {
      errors.push({
        path: `creators.${i}.user_id`,
        message: "A creator must be selected.",
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
  <div>
    <BoxedCheckbox
      :model-value="creatorsUnknown"
      :disabled="disabled"
      label="This map's creator is not known on Discord and hasn't interacted with the community"
      @update:model-value="toggleUnknown"
    />

    <template v-if="!creatorsUnknown">
      <div class="mt-3">
        <ListEditor
          :model-value="modelValue"
          :default="{ user_id: null, role: null } as CreatorEntry"
          :disabled="disabled"
          :min-items="1"
          add-label="Add Creator"
          @update:model-value="onRemove"
        >
          <template #item="{ index }">
            <div class="flex flex-col sm:flex-row gap-2">
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
                  v-if="fieldError(`creators.${index}.user_id`)"
                  class="text-(--color-danger) text-xs mt-1"
                >
                  {{ fieldError(`creators.${index}.user_id`) }}
                </p>
              </div>
              <div class="flex-1">
                <input
                  type="text"
                  :value="modelValue[index]!.role"
                  :disabled="disabled"
                  placeholder="Role (optional)"
                  class="w-full px-3 py-2 rounded-(--radius-btn) bg-(--color-primary) text-(--color-text) border border-(--color-contrast) focus:outline-none focus:border-(--color-active)"
                  :class="{
                    'border-(--color-danger)!': fieldError(
                      `creators.${index}.role`,
                    ),
                  }"
                  @input="
                    updateAt(index, {
                      role: ($event.target as HTMLInputElement).value || null,
                    })
                  "
                />
                <p
                  v-if="fieldError(`creators.${index}.role`)"
                  class="text-(--color-danger) text-xs mt-1"
                >
                  {{ fieldError(`creators.${index}.role`) }}
                </p>
              </div>
            </div>
          </template>
        </ListEditor>
      </div>
    </template>
  </div>
</template>
