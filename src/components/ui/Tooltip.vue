<script setup lang="ts">
import { computed, ref } from 'vue';
import { useFloating, offset, flip, shift, arrow, autoUpdate, type Placement } from '@floating-ui/vue';

const props = withDefaults(defineProps<{
  text: string;
  placement?: Placement;
  disabled?: boolean;
}>(), {
  placement: 'top',
  disabled: false,
});

const reference = ref<HTMLElement | null>(null);
const floating = ref<HTMLElement | null>(null);
const floatingArrow = ref<HTMLElement | null>(null);
const isOpen = ref(false);

const { floatingStyles, middlewareData, placement: resolvedPlacement } = useFloating(reference, floating, {
  placement: 'top',
  whileElementsMounted: autoUpdate,
  middleware: [
    offset(8),
    flip(),
    shift({ padding: 5 }),
    arrow({ element: floatingArrow }),
  ],
});

let hideTimeout: ReturnType<typeof setTimeout> | undefined;

function show() {
  if (props.disabled) return;
  clearTimeout(hideTimeout);
  isOpen.value = true;
}

function hide() {
  hideTimeout = setTimeout(() => { isOpen.value = false; }, 100);
}

function toggle() {
  isOpen.value ? hide() : show();
}

const arrowSide: Record<string, string> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

const arrowPlacementSide = computed(() =>
  arrowSide[resolvedPlacement.value.split('-')[0] ?? 'bottom'] ?? 'bottom'
);
</script>

<template>
  <div
    ref="reference"
    class="inline-flex"
    @mouseenter="show"
    @mouseleave="hide"
    @focus="show"
    @blur="hide"
    @click.prevent="toggle"
  >
    <slot />
  </div>

  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-150"
      leave-active-class="transition-opacity duration-100"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        ref="floating"
        :style="floatingStyles"
        class="z-[9999] rounded bg-[#222] px-2 py-1 text-sm text-white shadow-lg pointer-events-none"
        role="tooltip"
      >
        {{ text }}
        <div
          ref="floatingArrow"
          class="absolute w-2 h-2 bg-[#222] rotate-45"
          :style="{
            left: middlewareData.arrow?.x != null ? `${middlewareData.arrow.x}px` : '',
            top: middlewareData.arrow?.y != null ? `${middlewareData.arrow.y}px` : '',
            [arrowPlacementSide]: '-4px',
          }"
        />
      </div>
    </Transition>
  </Teleport>
</template>
