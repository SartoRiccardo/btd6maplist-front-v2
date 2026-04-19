<script setup lang="ts">
defineProps<{
  to: string;
  active?: boolean;
  disabled?: boolean;
}>();
</script>

<template>
  <RouterLink
    :to="disabled ? '' : to"
    :aria-disabled="disabled"
    :tabindex="disabled ? -1 : undefined"
    class="inline-block px-3 py-1.5 font-bold font-border-active rounded-(--radius-btn) no-underline! transition-colors! duration-200"
    :class="
      disabled
        ? 'bg-(--color-secondary) text-(--color-text-muted)! cursor-not-allowed opacity-50 pointer-events-none'
        : active
          ? 'bg-(--color-highlight) text-(--color-text-active)!'
          : 'bg-(--color-contrast) text-(--color-text-active)! hover:bg-(--color-active)!'
    "
    @click.capture="disabled && $event.preventDefault()"
  >
    <slot />
  </RouterLink>
</template>
