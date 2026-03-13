<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router';
import Navbar from '@/components/navbar/Navbar.vue';
import Footer from '@/components/layout/Footer.vue';

const route = useRoute();
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Navbar v-if="!route.meta['standalone']" />
    <main class="mx-auto w-full max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl px-4 flex-1">
      <RouterView />
    </main>
    <Footer v-if="!route.meta['standalone']" />
  </div>
</template>
