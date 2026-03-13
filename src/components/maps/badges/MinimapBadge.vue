<script setup lang="ts">
defineProps<{
  src: string;
}>();
</script>

<template>
  <div
    class="absolute top-[7%] left-[-4%] bg-(--color-contrast) shadow-[0_0_0.5rem_black]
           p-1 rounded z-10"
  >
    <img :src="src" alt="" class="h-16 md:h-16 w-auto block" loading="lazy" />
  </div>
</template>
