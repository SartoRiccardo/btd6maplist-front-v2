<template>
  <div class="bg-(--color-secondary) rounded-(--radius-panel) my-2 py-2 px-3 animate-pulse">
    <!-- Large screens -->
    <div class="hidden md:grid items-center gap-2" style="grid-template-columns: 1fr 9rem 10rem auto">
      <div class="min-w-0">
        <slot />
      </div>

      <!-- Medals -->
      <div class="flex items-center gap-2">
        <div class="w-[40px] h-[40px] bg-(--color-primary) rounded-full" />
        <div class="w-[40px] h-[40px] bg-(--color-primary) rounded-full" />
        <div class="w-[40px] h-[40px] bg-(--color-primary) rounded-full" />
      </div>

      <!-- Format -->
      <div class="flex items-center gap-1.5">
        <div class="w-6 h-6 bg-(--color-primary) rounded-full shrink-0" />
        <div class="h-4 w-20 bg-(--color-primary) rounded" />
      </div>

      <!-- Button -->
      <div class="w-8 h-8 bg-(--color-primary) rounded-(--radius-btn)" />
    </div>

    <!-- Small screens -->
    <div class="md:hidden">
      <div class="flex items-center gap-2">
        <div class="flex-1 min-w-0">
          <slot />
        </div>
        <div class="w-8 h-8 bg-(--color-primary) rounded-(--radius-btn) shrink-0" />
      </div>

      <div class="flex items-center gap-2 mt-2">
        <div class="flex items-center gap-2">
          <div class="w-[40px] h-[40px] bg-(--color-primary) rounded-full" />
          <div class="w-[40px] h-[40px] bg-(--color-primary) rounded-full" />
          <div class="w-[40px] h-[40px] bg-(--color-primary) rounded-full" />
        </div>
        <div class="flex items-center gap-1.5 ml-auto">
          <div class="w-6 h-6 bg-(--color-primary) rounded-full" />
          <div class="h-4 w-20 bg-(--color-primary) rounded" />
        </div>
      </div>
    </div>
  </div>
</template>
