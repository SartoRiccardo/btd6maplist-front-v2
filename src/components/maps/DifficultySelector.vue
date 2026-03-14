<script setup lang="ts">
import type { Difficulty } from '@/constants/difficulties';

defineProps<{
  difficulties: Difficulty[];
  modelValue: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

<template>
  <div v-if="difficulties.length >= 2" class="flex flex-wrap justify-center gap-2 md:gap-4">
    <div
      v-for="diff in difficulties"
      :key="diff.query"
      class="px-2 py-4 cursor-pointer"
      @click="emit('update:modelValue', diff.query)"
    >
      <div
        class="relative bg-(--color-secondary) rounded-full border-[7px] transition-[border-color] duration-300"
        :class="diff.query === modelValue
          ? 'border-(--color-highlight)'
          : 'border-(--color-contrast) hover:border-(--color-active)'"
      >
        <img
          :src="diff.image"
          :alt="diff.name"
          class="w-[60px] h-[60px] lg:w-[80px] lg:h-[80px] rounded-full"
        />
        <p class="absolute w-full left-0 bottom-[-1rem] mb-0 text-center font-['Luckiest_Guy'] font-border text-sm whitespace-nowrap">
          <span class="mx-[-100%]">{{ diff.name }}</span>
        </p>
      </div>
    </div>
  </div>
</template>
