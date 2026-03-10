<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router';
import Navbar from '@/components/Navbar.vue';

const route = useRoute();
</script>

<template>
  <div>
    <Navbar v-if="!route.meta['standalone']" />
    <RouterView />
  </div>
</template>
