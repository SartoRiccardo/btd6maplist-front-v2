<script setup lang="ts">
import { ref } from "vue";
import ImageDrop from "@/components/ui/ImageDrop.vue";
import Button from "@/components/ui/Button.vue";

const props = defineProps<{
  r6Start: string;
  r6StartFile: File | null;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  update: [payload: { r6_start: string; r6_start_file: File | null }];
}>();

const mode = ref<"url" | "file">(props.r6StartFile ? "file" : "url");

function setMode(m: "url" | "file") {
  mode.value = m;
  emit("update", { r6_start: "", r6_start_file: null });
}
</script>

<template>
  <div>
    <div class="flex gap-2 mb-2">
      <Button
        :active="mode === 'url'"
        :disabled="disabled"
        @click="setMode('url')"
      >
        URL
      </Button>
      <Button
        :active="mode === 'file'"
        :disabled="disabled"
        @click="setMode('file')"
      >
        Upload
      </Button>
    </div>

    <input
      v-if="mode === 'url'"
      type="text"
      :value="r6Start"
      :disabled="disabled"
      placeholder="https://..."
      class="w-full px-3 py-2 rounded-(--radius-btn) bg-(--color-primary) text-(--color-text) border border-(--color-contrast) focus:outline-none focus:border-(--color-active)"
      @input="
        emit('update', {
          r6_start: ($event.target as HTMLInputElement).value,
          r6_start_file: null,
        })
      "
    />

    <ImageDrop
      v-else
      :model-value="r6StartFile"
      :disabled="disabled"
      placeholder="Drop image here or click to browse"
      @update:model-value="
        emit('update', { r6_start: '', r6_start_file: $event })
      "
    />
  </div>
</template>
