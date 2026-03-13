<script setup lang="ts">
withDefaults(
  defineProps<{
    inverted?: boolean;
    bordered?: boolean;
  }>(),
  {
    inverted: false,
    bordered: true,
  }
);
</script>

<template>
  <div
    class="grid grid-cols-1 md:grid-cols-2 gap-6 py-8 items-center min-h-[25rem] animate-pulse"
    :class="{ 'border-b-2 border-(--color-secondary)': bordered }"
  >
    <!-- Hero + Maps placeholder -->
    <div
      class="relative flex justify-center order-last"
      :class="inverted ? 'md:order-first' : 'md:order-last'"
    >
      <div class="w-[350px] h-[350px] opacity-0" />
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[22rem] h-full">
        <div class="absolute bottom-8 left-0 w-[40%]">
          <div class="bg-(--color-secondary) rounded-(--radius-panel) aspect-[3/2] w-full" />
        </div>
        <div class="absolute bottom-8 right-0 w-[40%]">
          <div class="bg-(--color-secondary) rounded-(--radius-panel) aspect-[3/2] w-full" />
        </div>
        <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[40%]">
          <div class="bg-(--color-secondary) rounded-(--radius-panel) aspect-[3/2] w-full" />
        </div>
      </div>
    </div>

    <!-- Description placeholder -->
    <div class="flex flex-col justify-center items-center gap-3">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 bg-(--color-secondary) rounded-full" />
        <div class="h-7 w-48 bg-(--color-secondary) rounded" />
      </div>
      <div class="space-y-2 w-full px-4 md:px-12">
        <div class="h-4 w-full bg-(--color-secondary) rounded" />
        <div class="h-4 w-full bg-(--color-secondary) rounded" />
        <div class="h-4 w-3/4 bg-(--color-secondary) rounded mx-auto" />
      </div>
      <div class="h-10 w-52 bg-(--color-secondary) rounded-(--radius-btn) mt-3" />
    </div>
  </div>
</template>
