<script setup lang="ts">
import BoxedCheckboxSkeleton from "@/components/ui/BoxedCheckboxSkeleton.vue";
</script>

<template>
  <div class="flex flex-col gap-3 animate-pulse">
    <!-- Presentation -->
    <div>
      <div class="h-8 w-40 bg-(--color-primary) rounded mx-auto mb-3" />
      <hr class="border-(--color-contrast) mb-4" />
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Name / Slug / Hidden row -->
        <div class="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div class="h-4 w-12 bg-(--color-primary) rounded mb-2" />
            <div class="h-10 w-full bg-(--color-primary) rounded-(--radius-btn)" />
          </div>
          <div>
            <div class="h-4 w-10 bg-(--color-primary) rounded mb-2" />
            <div class="h-10 w-full bg-(--color-primary) rounded-(--radius-btn)" />
          </div>
          <div class="flex flex-col justify-end">
            <BoxedCheckboxSkeleton />
          </div>
        </div>

        <!-- Map Submission Status -->
        <div>
          <div class="h-4 w-44 bg-(--color-primary) rounded mb-2" />
          <div class="h-10 w-full bg-(--color-primary) rounded-(--radius-btn)" />
        </div>

        <!-- Run Submission Status -->
        <div>
          <div class="h-4 w-44 bg-(--color-primary) rounded mb-2" />
          <div class="h-10 w-full bg-(--color-primary) rounded-(--radius-btn)" />
        </div>

        <!-- Button Text -->
        <div>
          <div class="h-4 w-24 bg-(--color-primary) rounded mb-2" />
          <div class="h-10 w-full bg-(--color-primary) rounded-(--radius-btn)" />
        </div>

        <!-- Discord Server URL -->
        <div>
          <div class="h-4 w-36 bg-(--color-primary) rounded mb-2" />
          <div class="h-10 w-full bg-(--color-primary) rounded-(--radius-btn)" />
        </div>

        <!-- Description -->
        <div class="sm:col-span-2">
          <div class="h-4 w-24 bg-(--color-primary) rounded mb-2" />
          <div class="h-20 w-full bg-(--color-primary) rounded-(--radius-btn)" />
        </div>

        <!-- Leaderboard Types -->
        <div class="sm:col-span-2">
          <div class="h-4 w-36 bg-(--color-primary) rounded mb-3" />
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <BoxedCheckboxSkeleton />
            <BoxedCheckboxSkeleton />
            <BoxedCheckboxSkeleton />
          </div>
        </div>

        <!-- Preview Maps -->
        <div class="sm:col-span-2">
          <div class="h-4 w-28 bg-(--color-primary) rounded mb-2" />
          <div class="grid grid-cols-3 gap-3">
            <div class="h-24 bg-(--color-primary) rounded-(--radius-btn)" />
            <div class="h-24 bg-(--color-primary) rounded-(--radius-btn)" />
            <div class="h-24 bg-(--color-primary) rounded-(--radius-btn)" />
          </div>
        </div>
      </div>
    </div>

    <!-- Rules -->
    <div>
      <div class="h-8 w-20 bg-(--color-primary) rounded mx-auto mt-12 mb-3" />
      <hr class="border-(--color-contrast) mb-4" />
      <div class="flex flex-col gap-4">
        <!-- Map Submission Rules -->
        <div>
          <div class="h-4 w-44 bg-(--color-primary) rounded mb-2" />
          <div class="h-28 w-full bg-(--color-primary) rounded-(--radius-btn)" />
        </div>

        <!-- Completion Submission Rules -->
        <div>
          <div class="h-4 w-52 bg-(--color-primary) rounded mb-2" />
          <div class="h-28 w-full bg-(--color-primary) rounded-(--radius-btn)" />
        </div>
      </div>
    </div>
  </div>
</template>
