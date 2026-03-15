<script setup lang="ts">
import LinkButton from '@/components/ui/LinkButton.vue';
</script>

<template>
  <div>
    <h1 class="font-['Luckiest_Guy'] text-3xl md:text-4xl text-center mt-6 mb-4">
      My Submissions
    </h1>

    <div class="flex justify-center gap-4 mb-4">
      <LinkButton to="/my-submissions/maps" active>
        Map Submissions
      </LinkButton>
      <LinkButton to="/my-submissions/completions">
        Completion Submissions
      </LinkButton>
    </div>

    <p class="text-center text-(--color-text-muted) mb-6">
      Here are your pending and rejected map submissions.
    </p>
  </div>
</template>
