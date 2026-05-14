<script setup lang="ts">
import { ref, watch } from "vue";
import Button from "@/components/ui/Button.vue";

const props = withDefaults(
  defineProps<{
    title?: string;
    confirmLabel?: string;
    placeholder?: string;
    rows?: number;
  }>(),
  { title: "", confirmLabel: "Submit", placeholder: "", rows: 4 },
);

const open = ref(false);
const text = ref("");
const resolvePromise = ref<((value: string | null) => void) | null>(null);

function prompt(): Promise<string | null> {
  text.value = "";
  open.value = true;
  return new Promise((resolve) => {
    resolvePromise.value = resolve;
  });
}

function respond(value: string | null) {
  open.value = false;
  resolvePromise.value?.(value);
  resolvePromise.value = null;
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") respond(null);
}

watch(open, (isOpen) => {
  if (isOpen) document.addEventListener("keydown", onKeydown);
  else document.removeEventListener("keydown", onKeydown);
});

defineExpose({ prompt });
</script>

<template>
  <Teleport to="body">
    <Transition name="confirm-modal">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center"
        @click="respond(null)"
      >
        <div class="absolute inset-0 bg-black/80" />
        <div
          class="relative bg-(--color-secondary) rounded-(--radius-panel) p-6 max-w-sm w-[90%]"
          @click.stop
        >
          <p v-if="props.title" class="font-bold mb-3">{{ props.title }}</p>
          <textarea
            v-model="text"
            :rows="props.rows"
            :placeholder="props.placeholder"
            class="w-full px-3 py-2 rounded-(--radius-btn) bg-(--color-primary) text-(--color-text) border border-(--color-contrast) focus:outline-none focus:border-(--color-active) resize-y"
          />
          <div class="flex justify-center gap-3 mt-4">
            <Button @click="respond(null)">Cancel</Button>
            <Button :disabled="!text.trim()" active @click="respond(text.trim())">
              {{ props.confirmLabel }}
            </Button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.confirm-modal-enter-active,
.confirm-modal-leave-active {
  transition: opacity 0.2s ease;
}
.confirm-modal-enter-from,
.confirm-modal-leave-to {
  opacity: 0;
}
</style>
