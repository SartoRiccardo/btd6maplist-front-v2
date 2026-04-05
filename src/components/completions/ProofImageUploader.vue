<script setup lang="ts">
import { ref, onBeforeUnmount } from "vue";
import DropZone from "@/components/ui/DropZone.vue";
import ImageLightbox from "@/components/common/ImageLightbox.vue";

withDefaults(
  defineProps<{
    modelValue: File[];
    disabled?: boolean;
  }>(),
  { disabled: false },
);

const emit = defineEmits<{
  "update:modelValue": [files: File[]];
  error: [message: string];
}>();

const lightboxRef = ref<InstanceType<typeof ImageLightbox> | null>(null);

const urlCache = new Map<File, string>();

function getPreviewUrls(files: File[]): string[] {
  for (const [file, url] of urlCache) {
    if (!files.includes(file)) {
      URL.revokeObjectURL(url);
      urlCache.delete(file);
    }
  }
  return files.map((file) => {
    let url = urlCache.get(file);
    if (!url) {
      url = URL.createObjectURL(file);
      urlCache.set(file, url);
    }
    return url;
  });
}

onBeforeUnmount(() => {
  for (const url of urlCache.values()) {
    URL.revokeObjectURL(url);
  }
  urlCache.clear();
});
</script>

<template>
  <div>
    <DropZone
      :model-value="modelValue"
      accept="image/jpeg,image/png,image/gif,image/webp"
      :max-files="4"
      :max-size-bytes="10 * 1024 * 1024"
      :disabled="disabled"
      @update:model-value="emit('update:modelValue', $event)"
      @error="emit('error', $event)"
    >
      <template #files="{ files, removeFile }">
        <div
          v-if="files.length > 0"
          class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4"
        >
          <div
            v-for="(url, i) in getPreviewUrls(files)"
            :key="i"
            class="relative group"
          >
            <img
              :src="url"
              alt="Proof image"
              class="w-full aspect-[4/3] object-cover rounded-(--radius-panel) cursor-zoom-in hover:opacity-80 transition-opacity"
              @click="lightboxRef?.show(url)"
            />
            <button
              v-if="!disabled"
              type="button"
              class="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center text-sm hover:bg-red-600 transition-colors cursor-pointer"
              @click.stop="removeFile(i)"
            >
              <i class="bi bi-x" />
            </button>
          </div>
        </div>
      </template>
    </DropZone>

    <ImageLightbox ref="lightboxRef" />
  </div>
</template>
