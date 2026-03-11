<script setup lang="ts">
interface Props {
  src: string;
  alt?: string;
}

withDefaults(defineProps<Props>(), {
  alt: 'Icon',
});
</script>

<template>
  <img
    :alt="alt"
    :src="src"
    class="inline-block h-[1em] w-[1em] object-cover align-middle scale-150 translate-y-[0.1em]"
  />
</template>
