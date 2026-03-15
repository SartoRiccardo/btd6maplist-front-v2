<script setup lang="ts">
import { RouterLink } from 'vue-router';

const currentYear = new Date().getFullYear();
const copyrightYears = currentYear > 2024 ? `2024 - ${currentYear}` : '2024';
</script>

<template>
  <footer class="text-center text-xs px-3 mt-auto pt-12">
    <hr class="w-[70%] mx-auto border-(--color-secondary) mb-4" />
    <p class="mb-2">
      <RouterLink to="/maps/maplist/map-rules">Map Submission Rules</RouterLink>
      {{ " | " }}
      <RouterLink to="/maps/maplist/completion-rules">Completion Submission Rules</RouterLink>
      {{ " | " }}
      <a href="https://ko-fi.com/sarto" target="_blank">
        <i class="bi bi-cup-hot-fill" />&nbsp;Donate
      </a>
    </p>
    <p class="pb-6">&copy; {{ copyrightYears }} Sarto</p>
  </footer>
</template>
