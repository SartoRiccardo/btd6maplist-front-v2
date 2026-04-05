<script setup lang="ts" generic="T extends Record<string, any>">
import { ref, shallowRef, watch } from "vue";
import { refDebounced } from "@vueuse/core";
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxRoot,
  ComboboxViewport,
} from "reka-ui";

const props = withDefaults(
  defineProps<{
    modelValue: T | null;
    searchFn: (query: string) => Promise<T[]>;
    displayValue: (item: T) => string;
    placeholder?: string;
    disabled?: boolean;
    debounce?: number;
    minChars?: number;
  }>(),
  {
    placeholder: "Search...",
    disabled: false,
    debounce: 400,
    minChars: 1,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: T | null];
}>();

const searchTerm = ref("");
const debouncedSearch = refDebounced(searchTerm, props.debounce);
const options = shallowRef<T[]>([]);
const loading = ref(false);
async function fetchOptions(query: string) {
  if (query.length < props.minChars) {
    options.value = [];
    return;
  }
  loading.value = true;
  try {
    options.value = await props.searchFn(query);
  } finally {
    loading.value = false;
  }
}

watch(debouncedSearch, (query) => fetchOptions(query));

function onUpdate(value: T) {
  emit("update:modelValue", value ?? null);
}
</script>

<template>
  <ComboboxRoot
    :model-value="modelValue ?? undefined"
    :ignore-filter="true"
    :disabled="disabled"
    :open-on-focus="true"
    @update:model-value="onUpdate"
    @update:open="
      (open) => {
        if (open && options.length === 0 && !loading)
          fetchOptions(debouncedSearch);
      }
    "
  >
    <ComboboxAnchor
      class="flex items-center w-full rounded-(--radius-btn) bg-(--color-primary) border border-(--color-contrast) focus-within:border-(--color-active)"
    >
      <ComboboxInput
        v-model="searchTerm"
        :display-value="(v: T) => (v ? displayValue(v) : '')"
        :placeholder="placeholder"
        :disabled="disabled"
        class="flex-1 px-3 py-2 bg-transparent text-(--color-text) outline-none placeholder:text-(--color-text-muted)"
      />
    </ComboboxAnchor>

    <ComboboxContent
      class="mt-1 bg-(--color-secondary) rounded-(--radius-panel) shadow-lg border border-(--color-contrast) max-h-60 overflow-hidden z-50 w-[var(--reka-combobox-trigger-width)]"
      position="popper"
      :side-offset="4"
    >
      <ComboboxViewport class="p-1">
        <div
          v-if="loading"
          class="px-3 py-2 text-sm text-(--color-text-muted) text-center"
        >
          Loading...
        </div>

        <ComboboxEmpty
          v-else
          class="px-3 py-2 text-sm text-(--color-text-muted) text-center"
        >
          {{
            debouncedSearch.length < minChars
              ? `Type at least ${minChars} character${minChars > 1 ? "s" : ""}`
              : "No results found."
          }}
        </ComboboxEmpty>

        <ComboboxItem
          v-for="(option, i) in options"
          :key="i"
          :value="option as T"
          class="px-3 py-2 rounded-sm cursor-pointer text-(--color-text) data-[highlighted]:bg-(--color-active) data-[state=checked]:bg-(--color-highlight)/20"
        >
          <slot name="option" :option="option">
            {{ displayValue(option as T) }}
          </slot>
        </ComboboxItem>
      </ComboboxViewport>
    </ComboboxContent>
  </ComboboxRoot>
</template>
