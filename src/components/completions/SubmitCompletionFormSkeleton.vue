<script setup lang="ts">
import DropZoneSkeleton from '@/components/ui/DropZoneSkeleton.vue';
import BoxedCheckboxSkeleton from '@/components/ui/BoxedCheckboxSkeleton.vue';
import UrlListInputSkeleton from './UrlListInputSkeleton.vue';
</script>

<template>
  <div class="flex flex-col gap-6 animate-pulse">
    <!-- Proof Images -->
    <div>
      <div class="h-5 w-28 bg-(--color-primary) rounded mb-2" />
      <DropZoneSkeleton />
    </div>

    <!-- Proof Videos -->
    <UrlListInputSkeleton />

    <!-- Run Modifiers -->
    <div>
      <div class="h-5 w-32 bg-(--color-primary) rounded mb-2" />
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <BoxedCheckboxSkeleton />
        <BoxedCheckboxSkeleton />
        <BoxedCheckboxSkeleton />
      </div>
    </div>

    <!-- Notes -->
    <div>
      <div class="flex items-center gap-2 mb-1">
        <div class="h-5 w-14 bg-(--color-primary) rounded" />
        <div class="h-4 w-16 bg-(--color-primary) rounded" />
      </div>
      <div class="h-24 w-full bg-(--color-primary) rounded-(--radius-btn)" />
    </div>

    <!-- Buttons -->
    <div class="flex justify-end gap-2">
      <div class="h-9 w-20 bg-(--color-primary) rounded-(--radius-btn)" />
      <div class="h-9 w-20 bg-(--color-primary) rounded-(--radius-btn)" />
    </div>
  </div>
</template>
