<script setup lang="ts">
import { computed } from 'vue';
import type { Config } from '@/services/api/config/types';
import { calcMapPoints } from '@/utils/points';

const props = defineProps<{
  placement: number;
  config: Config;
}>();

const points = computed(() => calcMapPoints(props.placement, props.config));
</script>

<template>
  <div
    class="absolute top-[7%] left-[-4%] w-14 h-14 md:w-[3.5rem] md:h-[3.5rem]
           bg-(--color-contrast) shadow-[0_0_0.5rem_black] rounded-full
           flex flex-col justify-center text-center font-['Luckiest_Guy'] font-border z-10"
  >
    <p class="relative text-2xl md:text-[2rem] my-0 leading-none pt-2">
      #{{ placement }}
      <span class="absolute w-full left-0 bottom-[-0.7rem] text-[1.1rem]">
        {{ points }}<span class="ml-0.5">pt</span>
      </span>
    </p>
  </div>
</template>
