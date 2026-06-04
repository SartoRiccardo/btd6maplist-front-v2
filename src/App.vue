<script setup lang="ts">
import { ref, onErrorCaptured, onMounted } from "vue";
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

// Load Plausible analytics script in production
onMounted(() => {
  if (
    import.meta.env.PROD &&
    import.meta.env['VITE_PLAUSIBLE_DATA_DOMAIN'] &&
    import.meta.env['VITE_PLAUSIBLE_SCRIPT_SRC']
  ) {
    const script = document.createElement("script");
    script.defer = true;
    script.setAttribute("data-domain", import.meta.env['VITE_PLAUSIBLE_DATA_DOMAIN']);
    script.src = import.meta.env['VITE_PLAUSIBLE_SCRIPT_SRC'];
    document.head.appendChild(script);
  }
});
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Navbar v-if="!route.meta['standalone']" />
    <main
      class="mx-auto w-full max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl px-4 flex-1 overflow-hidden"
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
