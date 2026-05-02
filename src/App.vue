<script setup lang="ts">
import { ref, onErrorCaptured } from "vue";
import { RouterView, useRoute } from "vue-router";
import Navbar from "@/components/navbar/Navbar.vue";
import Footer from "@/components/layout/Footer.vue";
import ErrorFallback from "@/components/ui/ErrorFallback.vue";
import { useThemeStore } from "@/stores/theme";
import { Toaster } from "vue-sonner";

const route = useRoute();
// Initialize theme store so saved theme is applied on load
useThemeStore();

const renderError = ref<unknown>(null);

onErrorCaptured((err) => {
  renderError.value = err;
  return false;
});
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Navbar v-if="!route.meta['standalone']" />
    <main
      class="mx-auto w-full max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl px-4 flex-1"
    >
      <ErrorFallback
        v-if="renderError !== null"
        :error="renderError"
        @reset="renderError = null"
      />
      <RouterView v-else />
    </main>
    <Footer v-if="!route.meta['standalone']" />
  </div>
  <Toaster rich-colors close-button />
</template>
