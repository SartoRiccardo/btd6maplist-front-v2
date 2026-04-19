<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useMaps } from "@/services/api/maps/queries";
import type { MapWithMetadata } from "@/services/api/maps/types";
import Btd6Map from "@/components/maps/Btd6Map.vue";
import Btd6MapPlaceholder from "@/components/maps/Btd6MapPlaceholder.vue";
import Pagination from "@/components/ui/Pagination.vue";

const props = defineProps<{
  formatId: number;
}>();

const open = ref(false);
const page = ref(1);
const resolvePromise = ref<((value: MapWithMetadata | null) => void) | null>(
  null,
);

const { data: mapsData, isLoading } = useMaps(
  computed(() => ({
    format_id: props.formatId,
    page: page.value,
    per_page: 32,
  })),
);

const cachedMeta = ref<{ lastPage: number } | null>(null);
watch(
  () => mapsData.value,
  (data) => {
    if (data) cachedMeta.value = { lastPage: data.meta.last_page };
  },
);

function pick(): Promise<MapWithMetadata | null> {
  page.value = 1;
  open.value = true;
  return new Promise((resolve) => {
    resolvePromise.value = resolve;
  });
}

function respond(map: MapWithMetadata | null) {
  open.value = false;
  resolvePromise.value?.(map);
  resolvePromise.value = null;
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") respond(null);
}

watch(open, (isOpen) => {
  if (isOpen) document.addEventListener("keydown", onKeydown);
  else document.removeEventListener("keydown", onKeydown);
});

defineExpose({ pick });
</script>

<template>
  <Teleport to="body">
    <Transition name="pick-map-modal">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center"
        @click="respond(null)"
      >
        <div class="absolute inset-0 bg-black/80" />
        <div
          class="relative bg-(--color-secondary) rounded-(--radius-panel) p-6 pb-2 w-[90%] max-w-3xl max-h-[80vh] flex flex-col overflow-hidden"
          @click.stop
        >
          <h2 class="font-['Luckiest_Guy'] text-xl mb-4">Pick a Map</h2>

          <div class="overflow-y-auto py-3 flex-1">
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <template v-if="isLoading">
                <Btd6MapPlaceholder
                  v-for="n in 32"
                  :key="n"
                  class="my-0! mx-0!"
                />
              </template>
              <template v-else-if="mapsData">
                <div
                  v-for="map in mapsData.data"
                  :key="map.code"
                  class="cursor-pointer"
                  @click="respond(map)"
                >
                  <Btd6Map
                    :map="map"
                    class="my-0! mx-0! bg-(--color-contrast)! hover:bg-(--color-highlight)!"
                  />
                </div>
              </template>
            </div>
          </div>

          <Pagination
            v-if="cachedMeta"
            :current-page="page"
            :last-page="cachedMeta.lastPage"
            :disabled="isLoading"
            @update:current-page="page = $event"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.pick-map-modal-enter-active,
.pick-map-modal-leave-active {
  transition: opacity 0.2s ease;
}
.pick-map-modal-enter-from,
.pick-map-modal-leave-to {
  opacity: 0;
}
</style>
