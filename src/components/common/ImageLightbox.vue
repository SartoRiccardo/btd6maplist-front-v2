<script setup lang="ts">
import { ref, watch } from 'vue';

const open = ref(false);
const currentSrc = ref('');

function show(src: string) {
  currentSrc.value = src;
  open.value = true;
}

function close() {
  open.value = false;
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close();
}

watch(open, (isOpen) => {
  if (isOpen) {
    document.addEventListener('keydown', onKeydown);
  } else {
    document.removeEventListener('keydown', onKeydown);
  }
});

defineExpose({ show });
</script>

<template>
  <Teleport to="body">
    <Transition name="lightbox">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center cursor-pointer"
        @click="close"
      >
        <div class="absolute inset-0 bg-black/80" />
        <img
          :src="currentSrc"
          alt=""
          class="relative max-h-[90vh] max-w-[90vw] object-contain rounded-(--radius-panel) cursor-default"
          @click.stop
        />
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.2s ease;
}
.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}
</style>
