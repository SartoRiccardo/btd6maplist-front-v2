<script setup lang="ts">
import { computed } from "vue";
import { useTouchedProvider } from "@/composables/useTouchedFields";
import { useEmitOnChange } from "@/composables/useEmitOnChange";
import type { FormFieldError } from "@/services/api/formErrors";
import type { Map } from "@/services/api/maps/types";
import BoxedCheckbox from "@/components/ui/BoxedCheckbox.vue";
import PasswordField from "@/components/ui/PasswordField.vue";
import { MARKDOWN_ICONS } from "@/utils/markdownIcons";

const ICON_GROUPS = [
  {
    label: "Medals",
    names: [
      "completion",
      "no_geraldo",
      "no_optimal_hero",
      "black_border",
      "lcc",
    ],
  },
  {
    label: "Formats",
    names: [
      "maplist",
      "maplist_all_versions",
      "expert_list",
      "explist",
      "best_of_the_best",
      "botb",
      "nostalgia_pack",
      "np",
    ],
  },
  {
    label: "Expert List difficulties",
    names: [
      "explist_casual",
      "expert_list_casual",
      "explist_medium",
      "expert_list_medium",
      "explist_hard",
      "expert_list_hard",
      "explist_true",
      "expert_list_true",
      "explist_extreme",
      "expert_list_extreme",
    ],
  },
  {
    label: "BotB difficulties",
    names: [
      "botb_beginner",
      "best_of_the_best_beginner",
      "botb_intermediate",
      "best_of_the_best_intermediate",
      "botb_advanced",
      "best_of_the_best_advanced",
      "botb_expert",
      "best_of_the_best_expert",
    ],
  },
  {
    label: "Nostalgia Pack games",
    names: [
      "np_btd1",
      "nostalgia_pack_btd1",
      "np_ios",
      "nostalgia_pack_ios",
      "np_btd4",
      "nostalgia_pack_btd4",
      "np_btd5",
      "nostalgia_pack_btd5",
      "np_btdb1",
      "nostalgia_pack_btdb1",
      "np_bmc",
      "nostalgia_pack_bmc",
      "np_battd",
      "nostalgia_pack_battd",
      "np_btdb2",
      "nostalgia_pack_btdb2",
    ],
  },
] as const;
import PreviewMapsInput, {
  type PreviewMapsValue,
} from "./PreviewMapsInput.vue";

export interface FormatPresentationFormModel {
  name: string;
  slug: string;
  hidden: boolean;
  map_submission_status: "closed" | "open" | "open_chimps" | "with_recording";
  run_submission_status: "closed" | "open" | "lcc_only";
  is_lcc_leaderboard_enabled: boolean;
  is_no_geraldo_leaderboard_enabled: boolean;
  is_black_border_leaderboard_enabled: boolean;
  button_text: string;
  discord_server_url: string;
  description: string;
  preview_map_1_code: string;
  preview_map_2_code: string;
  preview_map_3_code: string;
  map_submission_rules: string;
  completion_submission_rules: string;
  map_submission_wh: string;
  run_submission_wh: string;
}

const props = withDefaults(
  defineProps<{
    modelValue: FormatPresentationFormModel;
    formatId: number;
    initialMaps?: [Map | null, Map | null, Map | null];
    disabled?: boolean;
    externalErrors?: FormFieldError[];
  }>(),
  { disabled: false, externalErrors: () => [] },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: FormatPresentationFormModel): void;
  (e: "errors", value: FormFieldError[]): void;
}>();

const { touchAll, clearTouched, isTouched, touch } = useTouchedProvider();
defineExpose({ touchAll, clearTouched });

function update(partial: Partial<FormatPresentationFormModel>) {
  for (const key of Object.keys(partial)) touch(key);
  emit("update:modelValue", { ...props.modelValue, ...partial });
}

function handlePreviewMapsUpdate(val: PreviewMapsValue) {
  const m = props.modelValue;
  if (val.map1 !== m.preview_map_1_code) touch("preview_map_1_code");
  if (val.map2 !== m.preview_map_2_code) touch("preview_map_2_code");
  if (val.map3 !== m.preview_map_3_code) touch("preview_map_3_code");
  emit("update:modelValue", {
    ...m,
    preview_map_1_code: val.map1,
    preview_map_2_code: val.map2,
    preview_map_3_code: val.map3,
  });
}

const previewMapsValue = computed<PreviewMapsValue>(() => ({
  map1: props.modelValue.preview_map_1_code,
  map2: props.modelValue.preview_map_2_code,
  map3: props.modelValue.preview_map_3_code,
}));

const ownErrors = computed<FormFieldError[]>(() => {
  const errors: FormFieldError[] = [];
  if (!props.modelValue.name.trim()) {
    errors.push({
      path: "name",
      message: "Name is required.",
      source: "validation",
    });
  }
  const slug = props.modelValue.slug.trim();
  if (slug && !/^[a-z0-9-]+$/.test(slug)) {
    errors.push({
      path: "slug",
      message: "Slug may only contain lowercase letters, digits, and hyphens.",
      source: "validation",
    });
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

const inputClass =
  "w-full px-3 py-2 rounded-(--radius-btn) bg-(--color-primary) text-(--color-text) border border-(--color-contrast) focus:outline-none focus:border-(--color-active)";
const errorClass = "border-(--color-danger)!";
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- Presentation -->
    <div>
      <h2 class="font-['Luckiest_Guy'] text-2xl text-center">Presentation</h2>
      <hr class="border-(--color-contrast) mb-4" />
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block font-bold mb-1">Name</label>
            <input
              type="text"
              :value="modelValue.name"
              :disabled="disabled"
              :class="[inputClass, fieldError('name') ? errorClass : '']"
              @input="
                update({ name: ($event.target as HTMLInputElement).value })
              "
            />
            <p
              v-if="fieldError('name')"
              class="text-(--color-danger) text-sm mt-1"
            >
              {{ fieldError("name") }}
            </p>
          </div>

          <div>
            <label class="block font-bold mb-1">Slug</label>
            <input
              type="text"
              :value="modelValue.slug"
              :disabled="disabled"
              placeholder="e.g. maplist"
              :class="[inputClass, fieldError('slug') ? errorClass : '']"
              @input="
                update({ slug: ($event.target as HTMLInputElement).value })
              "
            />
            <p
              v-if="fieldError('slug')"
              class="text-(--color-danger) text-sm mt-1"
            >
              {{ fieldError("slug") }}
            </p>
          </div>

          <div class="flex flex-col justify-end">
            <BoxedCheckbox
              :model-value="modelValue.hidden"
              :disabled="disabled"
              label="Hidden"
              @update:model-value="update({ hidden: $event })"
            />
          </div>
        </div>

        <div>
          <label class="block font-bold mb-1">Map Submission Status</label>
          <select
            :value="modelValue.map_submission_status"
            :disabled="disabled"
            :class="[
              inputClass,
              fieldError('map_submission_status') ? errorClass : '',
            ]"
            @change="
              update({
                map_submission_status: ($event.target as HTMLSelectElement)
                  .value as FormatPresentationFormModel['map_submission_status'],
              })
            "
          >
            <option value="closed">Closed</option>
            <option value="open">Open</option>
            <option value="open_chimps">Open (CHIMPS only)</option>
          </select>
          <p
            v-if="fieldError('map_submission_status')"
            class="text-(--color-danger) text-sm mt-1"
          >
            {{ fieldError("map_submission_status") }}
          </p>
        </div>

        <div>
          <label class="block font-bold mb-1">Run Submission Status</label>
          <select
            :value="modelValue.run_submission_status"
            :disabled="disabled"
            :class="[
              inputClass,
              fieldError('run_submission_status') ? errorClass : '',
            ]"
            @change="
              update({
                run_submission_status: ($event.target as HTMLSelectElement)
                  .value as FormatPresentationFormModel['run_submission_status'],
              })
            "
          >
            <option value="closed">Closed</option>
            <option value="open">Open</option>
            <option value="lcc_only">LCC only</option>
          </select>
          <p
            v-if="fieldError('run_submission_status')"
            class="text-(--color-danger) text-sm mt-1"
          >
            {{ fieldError("run_submission_status") }}
          </p>
        </div>

        <div>
          <label class="block font-bold mb-1">Map Submission Webhook</label>
          <PasswordField
            :model-value="modelValue.map_submission_wh"
            :disabled="disabled"
            :error="fieldError('map_submission_wh')"
            @update:model-value="update({ map_submission_wh: $event })"
          />
          <p
            v-if="fieldError('map_submission_wh')"
            class="text-(--color-danger) text-sm mt-1"
          >
            {{ fieldError("map_submission_wh") }}
          </p>
        </div>

        <div>
          <label class="block font-bold mb-1">Run Submission Webhook</label>
          <PasswordField
            :model-value="modelValue.run_submission_wh"
            :disabled="disabled"
            :error="fieldError('run_submission_wh')"
            @update:model-value="update({ run_submission_wh: $event })"
          />
          <p
            v-if="fieldError('run_submission_wh')"
            class="text-(--color-danger) text-sm mt-1"
          >
            {{ fieldError("run_submission_wh") }}
          </p>
        </div>

        <div>
          <label class="block font-bold mb-1">Button Text</label>
          <input
            type="text"
            :value="modelValue.button_text"
            :disabled="disabled"
            :class="[inputClass, fieldError('button_text') ? errorClass : '']"
            @input="
              update({ button_text: ($event.target as HTMLInputElement).value })
            "
          />
          <p
            v-if="fieldError('button_text')"
            class="text-(--color-danger) text-sm mt-1"
          >
            {{ fieldError("button_text") }}
          </p>
        </div>

        <div>
          <label class="block font-bold mb-1">Discord Server URL</label>
          <input
            type="url"
            :value="modelValue.discord_server_url"
            :disabled="disabled"
            :class="[
              inputClass,
              fieldError('discord_server_url') ? errorClass : '',
            ]"
            @input="
              update({
                discord_server_url: ($event.target as HTMLInputElement).value,
              })
            "
          />
          <p
            v-if="fieldError('discord_server_url')"
            class="text-(--color-danger) text-sm mt-1"
          >
            {{ fieldError("discord_server_url") }}
          </p>
        </div>

        <div class="sm:col-span-2">
          <label class="block font-bold mb-1">Description</label>
          <textarea
            :value="modelValue.description"
            :disabled="disabled"
            rows="3"
            :class="[
              inputClass,
              'resize-y',
              fieldError('description') ? errorClass : '',
            ]"
            @input="
              update({
                description: ($event.target as HTMLTextAreaElement).value,
              })
            "
          />
          <p
            v-if="fieldError('description')"
            class="text-(--color-danger) text-sm mt-1"
          >
            {{ fieldError("description") }}
          </p>
        </div>

        <div class="sm:col-span-2">
          <label class="block font-bold mb-2">Leaderboard Types</label>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <BoxedCheckbox
                :model-value="modelValue.is_lcc_leaderboard_enabled"
                :disabled="disabled"
                icon="/images/medals/medal_lcc.webp"
                label="LCCs"
                @update:model-value="
                  update({ is_lcc_leaderboard_enabled: $event })
                "
              />
              <p
                v-if="fieldError('is_lcc_leaderboard_enabled')"
                class="text-(--color-danger) text-sm mt-1"
              >
                {{ fieldError("is_lcc_leaderboard_enabled") }}
              </p>
            </div>
            <div>
              <BoxedCheckbox
                :model-value="modelValue.is_no_geraldo_leaderboard_enabled"
                :disabled="disabled"
                icon="/images/medals/medal_nogerry.webp"
                label="No Optimal Hero"
                @update:model-value="
                  update({ is_no_geraldo_leaderboard_enabled: $event })
                "
              />
              <p
                v-if="fieldError('is_no_geraldo_leaderboard_enabled')"
                class="text-(--color-danger) text-sm mt-1"
              >
                {{ fieldError("is_no_geraldo_leaderboard_enabled") }}
              </p>
            </div>
            <div>
              <BoxedCheckbox
                :model-value="modelValue.is_black_border_leaderboard_enabled"
                :disabled="disabled"
                icon="/images/medals/medal_bb.webp"
                label="Black Border"
                @update:model-value="
                  update({ is_black_border_leaderboard_enabled: $event })
                "
              />
              <p
                v-if="fieldError('is_black_border_leaderboard_enabled')"
                class="text-(--color-danger) text-sm mt-1"
              >
                {{ fieldError("is_black_border_leaderboard_enabled") }}
              </p>
            </div>
          </div>
        </div>

        <div class="sm:col-span-2">
          <label class="block font-bold mb-1">Preview Maps</label>
          <PreviewMapsInput
            :model-value="previewMapsValue"
            :format-id="formatId"
            :initial-maps="initialMaps"
            :disabled="disabled"
            :errors="{
              map1: fieldError('preview_map_1_code'),
              map2: fieldError('preview_map_2_code'),
              map3: fieldError('preview_map_3_code'),
            }"
            @update:model-value="handlePreviewMapsUpdate"
          />
        </div>
      </div>
    </div>

    <!-- Rules -->
    <div>
      <h2 class="font-['Luckiest_Guy'] text-2xl text-center pt-12">Rules</h2>
      <hr class="border-(--color-contrast) mb-4" />
      <div class="flex flex-col gap-4">
        <div>
          <label class="block font-bold mb-1">Map Submission Rules</label>
          <textarea
            :value="modelValue.map_submission_rules"
            :disabled="disabled"
            rows="4"
            :class="[
              inputClass,
              'resize-y',
              fieldError('map_submission_rules') ? errorClass : '',
            ]"
            @input="
              update({
                map_submission_rules: ($event.target as HTMLTextAreaElement)
                  .value,
              })
            "
          />
          <p
            v-if="fieldError('map_submission_rules')"
            class="text-(--color-danger) text-sm mt-1"
          >
            {{ fieldError("map_submission_rules") }}
          </p>
        </div>

        <div>
          <label class="block font-bold mb-1"
            >Completion Submission Rules</label
          >
          <textarea
            :value="modelValue.completion_submission_rules"
            :disabled="disabled"
            rows="4"
            :class="[
              inputClass,
              'resize-y',
              fieldError('completion_submission_rules') ? errorClass : '',
            ]"
            @input="
              update({
                completion_submission_rules: (
                  $event.target as HTMLTextAreaElement
                ).value,
              })
            "
          />
          <p
            v-if="fieldError('completion_submission_rules')"
            class="text-(--color-danger) text-sm mt-1"
          >
            {{ fieldError("completion_submission_rules") }}
          </p>
        </div>

        <details
          class="rounded-(--radius-btn) bg-(--color-primary) px-4 py-2 text-sm"
        >
          <summary
            class="cursor-pointer font-bold text-(--color-text-muted) select-none"
          >
            Markdown reference
          </summary>
          <div
            class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-(--color-text-muted)"
          >
            <div class="contents font-mono">
              <span># Heading 1</span><span>H1 heading</span>
              <span>## Heading 2</span><span>H2 heading</span>
              <span>**bold**</span><span>Bold text</span> <span>*italic*</span
              ><span>Italic text</span> <span>`code`</span
              ><span>Inline code</span> <span>[text](url)</span
              ><span>Link</span> <span>- item</span><span>Unordered list</span>
              <span>1. item</span><span>Ordered list</span>
              <span>&gt; text</span><span>Blockquote</span>
            </div>
            <div
              class="sm:col-span-2 mt-2 border-t border-(--color-contrast) pt-2 flex flex-col gap-1"
            >
              <p>
                <code class="bg-(--color-secondary) px-1 rounded"
                  >:icon_name:</code
                >
                — inline icon (no border)
              </p>
              <p>
                <code class="bg-(--color-secondary) px-1 rounded"
                  >:(icon_name):</code
                >
                — icon with badge border
              </p>
            </div>
          </div>

          <div
            class="mt-3 border-t border-(--color-contrast) pt-3 flex flex-col gap-3"
          >
            <div v-for="group in ICON_GROUPS" :key="group.label">
              <p class="font-bold mb-1">{{ group.label }}</p>
              <div class="flex flex-wrap gap-x-4 gap-y-1">
                <span
                  v-for="name in group.names"
                  :key="name"
                  class="flex items-center gap-1"
                >
                  <img
                    :src="MARKDOWN_ICONS[name]"
                    :alt="name"
                    class="w-4 h-4 object-cover inline-block"
                  />
                  <code class="bg-(--color-secondary) px-1 rounded">{{
                    name
                  }}</code>
                </span>
              </div>
            </div>
          </div>
        </details>
      </div>
    </div>
  </div>
</template>
