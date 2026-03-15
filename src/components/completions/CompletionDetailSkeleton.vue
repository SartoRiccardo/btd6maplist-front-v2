<template>
  <div class="animate-pulse pt-3">
    <!-- Notes -->
    <div class="mb-6">
      <div class="h-4 w-3/4 bg-(--color-primary) rounded mb-2" />
      <div class="h-4 w-1/2 bg-(--color-primary) rounded mb-3" />
      <div class="flex items-center gap-2 mt-2">
        <div class="h-3 w-36 bg-(--color-primary) rounded" />
        <div class="w-[30px] h-[30px] bg-(--color-primary) rounded-sm" />
        <div class="h-3 w-20 bg-(--color-primary) rounded" />
      </div>
    </div>

    <!-- Images header -->
    <div class="h-5 w-40 bg-(--color-primary) rounded mb-3" />
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
      <div class="w-full aspect-video bg-(--color-primary) rounded-(--radius-panel)" />
      <div class="w-full aspect-video bg-(--color-primary) rounded-(--radius-panel)" />
    </div>

    <!-- Videos header -->
    <div class="h-5 w-44 bg-(--color-primary) rounded mb-3" />
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <div class="w-full aspect-video bg-(--color-primary) rounded-(--radius-panel)" />
    </div>
  </div>
</template>
