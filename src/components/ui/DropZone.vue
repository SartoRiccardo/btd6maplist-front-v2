<script setup lang="ts">
import { ref, computed } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: File[];
    accept?: string;
    maxFiles?: number;
    maxSizeBytes?: number;
    disabled?: boolean;
    placeholder?: string;
  }>(),
  {
    accept: 'image/*',
    maxFiles: 4,
    maxSizeBytes: 10 * 1024 * 1024,
    placeholder: 'Drop files here or click to browse',
  }
);

const emit = defineEmits<{
  'update:modelValue': [files: File[]];
  error: [message: string];
}>();

const dragging = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

const canAddMore = computed(() => props.modelValue.length < props.maxFiles);

function openFilePicker() {
  if (props.disabled || !canAddMore.value) return;
  fileInput.value?.click();
}

function onInputChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files) {
    addFiles(Array.from(input.files));
  }
  input.value = '';
}

function onDrop(event: DragEvent) {
  dragging.value = false;
  if (props.disabled) return;
  const files = Array.from(event.dataTransfer?.files ?? []);
  addFiles(files);
}

function onDragEnter() {
  if (!props.disabled) dragging.value = true;
}

function onDragLeave(event: DragEvent) {
  const related = event.relatedTarget as Node | null;
  if (!related || !(event.currentTarget as HTMLElement).contains(related)) {
    dragging.value = false;
  }
}

function addFiles(incoming: File[]) {
  const accepted = props.accept
    .split(',')
    .map((s) => s.trim());

  const valid: File[] = [];
  for (const file of incoming) {
    if (!matchesAccept(file, accepted)) {
      emit('error', `"${file.name}" is not an accepted file type.`);
      continue;
    }
    if (file.size > props.maxSizeBytes) {
      emit('error', `"${file.name}" exceeds the maximum file size.`);
      continue;
    }
    valid.push(file);
  }

  const room = props.maxFiles - props.modelValue.length;
  if (valid.length > room) {
    emit('error', `You can only upload up to ${props.maxFiles} files.`);
  }

  const toAdd = valid.slice(0, room);
  if (toAdd.length > 0) {
    emit('update:modelValue', [...props.modelValue, ...toAdd]);
  }
}

function removeFile(index: number) {
  if (props.disabled) return;
  const next = [...props.modelValue];
  next.splice(index, 1);
  emit('update:modelValue', next);
}

function matchesAccept(file: File, patterns: string[]): boolean {
  for (const pattern of patterns) {
    if (pattern.startsWith('.')) {
      if (file.name.toLowerCase().endsWith(pattern.toLowerCase())) return true;
    } else if (pattern.endsWith('/*')) {
      const prefix = pattern.slice(0, -1);
      if (file.type.startsWith(prefix)) return true;
    } else {
      if (file.type === pattern) return true;
    }
  }
  return false;
}

defineExpose({ removeFile });
</script>

<template>
  <div>
    <div
      class="border-2 border-dashed rounded-(--radius-panel) p-6 text-center transition-colors cursor-pointer"
      :class="[
        disabled
          ? 'border-gray-600 opacity-50 cursor-not-allowed'
          : dragging
            ? 'border-(--color-highlight) bg-(--color-highlight)/10'
            : canAddMore
              ? 'border-(--color-contrast) hover:border-(--color-highlight)'
              : 'border-gray-600 cursor-default',
      ]"
      @click="openFilePicker"
      @drop.prevent="onDrop"
      @dragover.prevent="onDragEnter"
      @dragenter.prevent="onDragEnter"
      @dragleave="onDragLeave"
    >
      <slot name="dropzone" :dragging="dragging" :can-add-more="canAddMore" :disabled="disabled">
        <p class="text-(--color-text-muted)">
          {{ canAddMore ? placeholder : `Maximum of ${maxFiles} files reached` }}
        </p>
      </slot>
      <input
        ref="fileInput"
        type="file"
        :accept="accept"
        :multiple="maxFiles > 1"
        :disabled="disabled"
        class="hidden"
        @change="onInputChange"
      />
    </div>

    <slot name="files" :files="modelValue" :remove-file="removeFile" :disabled="disabled" />
  </div>
</template>
