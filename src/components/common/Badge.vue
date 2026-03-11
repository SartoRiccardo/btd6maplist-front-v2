<script setup lang="ts">
interface Props {
  src: string;
  alt?: string;
}

withDefaults(defineProps<Props>(), {
  alt: 'Badge',
});
</script>

<template>
  <img
    :alt="alt"
    :src="src"
    class="inline-block h-[1.5em] w-[1.5em] rounded-full border-[0.15em] border-(--color-highlight) object-cover align-middle -translate-y-[0.2rem]"
  />
</template>
