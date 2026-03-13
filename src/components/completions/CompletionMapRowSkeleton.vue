<template>
  <div class="bg-(--color-secondary) rounded-(--radius-panel) my-2 py-2 px-3 animate-pulse">
    <!-- Row 1: Map preview + name -->
    <div class="flex items-center">
      <div class="w-24 aspect-[3/2] bg-(--color-primary) rounded-sm shrink-0" />
      <div class="h-5 w-40 bg-(--color-primary) rounded ml-3" />
    </div>

    <!-- Row 2: Player + medals -->
    <div class="flex items-center justify-between mt-2">
      <div class="flex items-center gap-2">
        <div class="w-[45px] h-[45px] bg-(--color-primary) rounded-sm" />
        <div>
          <div class="h-4 w-28 bg-(--color-primary) rounded" />
          <div class="h-3 w-20 bg-(--color-primary) rounded mt-1" />
        </div>
      </div>
      <div class="flex gap-2">
        <div class="w-[45px] h-[45px] bg-(--color-primary) rounded-full" />
        <div class="w-[45px] h-[45px] bg-(--color-primary) rounded-full" />
      </div>
    </div>
  </div>
</template>
