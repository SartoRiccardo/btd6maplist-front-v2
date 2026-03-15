<template>
  <div class="bg-(--color-secondary) rounded-(--radius-panel) p-[5px] animate-pulse">
    <!-- Banner area -->
    <div class="flex py-3 bg-(--color-primary) rounded-[0.5rem] px-2">
      <!-- Avatar -->
      <div class="w-24 h-24 bg-(--color-secondary) rounded-[0.7rem] shrink-0" />

      <!-- Name & Roles -->
      <div class="pl-3 flex flex-col gap-3">
        <div class="h-8 w-48 bg-(--color-secondary) rounded" />
        <div class="flex gap-2">
          <div class="h-6 w-20 bg-(--color-secondary) rounded-[0.3rem]" />
          <div class="h-6 w-24 bg-(--color-secondary) rounded-[0.3rem]" />
          <div class="h-6 w-16 bg-(--color-secondary) rounded-[0.3rem]" />
        </div>
      </div>
    </div>

    <!-- Medals -->
    <div class="flex justify-center gap-3 pt-2">
      <div class="w-[60px] h-[60px] bg-(--color-primary) rounded-full" />
      <div class="w-[60px] h-[60px] bg-(--color-primary) rounded-full" />
      <div class="w-[60px] h-[60px] bg-(--color-primary) rounded-full" />
    </div>
  </div>
</template>
