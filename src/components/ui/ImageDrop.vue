<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from "vue";
import DropZone from "@/components/ui/DropZone.vue";
import ImageLightbox from "@/components/common/ImageLightbox.vue";

const props = withDefaults(
  defineProps<{
    modelValue: File | null;
    disabled?: boolean;
    placeholder?: string;
  }>(),
  { disabled: false },
);

const emit = defineEmits<{
  "update:modelValue": [file: File | null];
  error: [message: string];
}>();

const lightboxRef = ref<InstanceType<typeof ImageLightbox> | null>(null);

const filesArray = computed(() => (props.modelValue ? [props.modelValue] : []));

let previewUrl: string | null = null;

function getPreviewUrl(): string {
  if (!props.modelValue) return "";
  if (previewUrl) return previewUrl;
  previewUrl = URL.createObjectURL(props.modelValue);
  return previewUrl;
}

function revokeUrl() {
  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
    previewUrl = null;
  }
}

function onFilesChange(files: File[]) {
  revokeUrl();
  emit("update:modelValue", files[0] ?? null);
}

function removeImage() {
  revokeUrl();
  emit("update:modelValue", null);
}

onBeforeUnmount(revokeUrl);
</script>

<template>
  <div>
    <!-- Image preview -->
    <div v-if="modelValue" class="flex justify-center">
      <div class="relative inline-block">
        <img
          :src="getPreviewUrl()"
          alt="Uploaded image"
          class="max-w-xs aspect-[4/3] object-cover rounded-(--radius-panel) cursor-zoom-in hover:opacity-80 transition-opacity"
          @click="lightboxRef?.show(getPreviewUrl())"
        />
        <button
          v-if="!disabled"
          type="button"
          class="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center text-sm hover:bg-red-600 transition-colors cursor-pointer"
          @click="removeImage"
        >
          <i class="bi bi-x" />
        </button>
      </div>
    </div>

    <!-- Drop zone -->
    <DropZone
      v-else
      :model-value="filesArray"
      accept="image/jpeg,image/png,image/gif,image/webp"
      :max-files="1"
      :max-size-bytes="10 * 1024 * 1024"
      :disabled="disabled"
      :placeholder="placeholder"
      @update:model-value="onFilesChange"
      @error="emit('error', $event)"
    >
      <template v-if="$slots['default']" #dropzone="slotProps">
        <slot v-bind="slotProps" />
      </template>
    </DropZone>

    <ImageLightbox ref="lightboxRef" />
  </div>
</template>
