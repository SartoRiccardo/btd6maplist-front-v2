/* eslint-disable sort-imports */

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/postcss";
import VueI18nPlugin from "@intlify/unplugin-vue-i18n/vite";

import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [
    vue(),
    VueI18nPlugin({
      include: [
        fileURLToPath(new URL("./src/locales/**", import.meta.url)),
        fileURLToPath(new URL("./src/**/*.vue", import.meta.url)),
      ],
    }),
  ],
  build: {
    sourcemap: true,
  },
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
