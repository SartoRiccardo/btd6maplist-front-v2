<script setup lang="ts">
import { ref, watch } from "vue";
import Button from "@/components/ui/Button.vue";

const props = withDefaults(
  defineProps<{
    confirmLabel?: string;
    danger?: boolean;
  }>(),
  { confirmLabel: "Confirm", danger: false },
);

const open = ref(false);
const resolvePromise = ref<((value: boolean) => void) | null>(null);

function confirm(): Promise<boolean> {
  open.value = true;
  return new Promise((resolve) => {
    resolvePromise.value = resolve;
  });
}

function respond(value: boolean) {
  open.value = false;
  resolvePromise.value?.(value);
  resolvePromise.value = null;
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") respond(false);
}

watch(open, (isOpen) => {
  if (isOpen) {
    document.addEventListener("keydown", onKeydown);
  } else {
    document.removeEventListener("keydown", onKeydown);
  }
});

defineExpose({ confirm });
</script>

<template>
  <Teleport to="body">
    <Transition name="confirm-modal">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center"
        @click="respond(false)"
      >
        <div class="absolute inset-0 bg-black/80" />
        <div
          class="relative bg-(--color-secondary) rounded-(--radius-panel) p-6 max-w-sm w-[90%]"
          @click.stop
        >
          <slot>
            <p class="text-center mb-0">Are you sure?</p>
          </slot>

          <div class="flex justify-center gap-3 mt-4">
            <Button @click="respond(false)">Cancel</Button>
            <Button :active="!props.danger" :danger="props.danger" @click="respond(true)">{{ props.confirmLabel }}</Button>
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
