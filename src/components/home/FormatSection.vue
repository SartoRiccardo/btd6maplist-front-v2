<script setup lang="ts">
import { RouterLink } from 'vue-router';
import type { Format } from '@/services/api/formats/types';
import Btd6Map from '@/components/maps/Btd6Map.vue';

defineProps<{
  format: Format;
  heroUrl: string;
  iconUrl: string;
  inverted?: boolean;
  bordered?: boolean;
}>();
</script>

<template>
  <div
    class="grid grid-cols-1 md:grid-cols-2 gap-6 py-8 items-center min-h-[25rem]"
    :class="{ 'border-b-2 border-(--color-secondary)': bordered }"
  >
    <!-- Hero + Maps -->
    <div
      class="relative flex justify-center order-last"
      :class="inverted ? 'md:order-first' : 'md:order-last'"
    >
      <img
        :src="heroUrl"
        alt=""
        class="w-[350px] h-[350px] object-contain"
      />
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[22rem] h-full">
        <div v-if="format.preview_map1" class="absolute bottom-8 left-0 w-[40%] animate-float-slow" style="animation-delay: 0s">
          <Btd6Map :code="format.preview_map1.code" />
        </div>
        <div v-if="format.preview_map2" class="absolute bottom-8 right-0 w-[40%] animate-float-slow" style="animation-delay: -2.3s">
          <Btd6Map :code="format.preview_map2.code" />
        </div>
        <div v-if="format.preview_map3" class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[40%] animate-float-slow" style="animation-delay: -4.7s">
          <Btd6Map :code="format.preview_map3.code" />
        </div>
      </div>
    </div>

    <!-- Description -->
    <div class="flex flex-col justify-center items-center">
      <h2 class="font-['Oswald'] text-2xl md:text-3xl font-bold mb-3">
        <img
          :src="iconUrl"
          alt=""
          class="inline-block w-8 h-8 mb-1 mr-1 rounded-full border-2 border-(--color-highlight)"
        />
        {{ format.name }}
      </h2>
      <p class="px-4 md:px-12">{{ format.description }}</p>
      <div class="pt-6">
        <RouterLink
          :to="`/maps/${format.id}`"
          class="font-border inline-block no-underline! px-5 py-2 rounded-(--radius-btn) text-lg font-bold
                 bg-(--color-highlight) text-(--color-text)!
                 hover:bg-(--color-active) hover:text-(--color-text)! transition-colors duration-200"
        >
          {{ format.button_text }}
        </RouterLink>
      </div>
    </div>
  </div>
</template>
