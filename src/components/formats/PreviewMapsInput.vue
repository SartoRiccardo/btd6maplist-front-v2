<script setup lang="ts">
import { ref, watch } from "vue";
import type { Map, MapWithMetadata } from "@/services/api/maps/types";
import Btd6Map from "@/components/maps/Btd6Map.vue";
import Btd6MapPlaceholder from "@/components/maps/Btd6MapPlaceholder.vue";
import PickMapModal from "./PickMapModal.vue";

export interface PreviewMapsValue {
  map1: string;
  map2: string;
  map3: string;
}

const props = withDefaults(
  defineProps<{
    modelValue: PreviewMapsValue;
    formatId: number;
    initialMaps?: [Map | null, Map | null, Map | null];
    disabled?: boolean;
    errors?: { map1?: string; map2?: string; map3?: string };
  }>(),
  { disabled: false, errors: () => ({}) },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: PreviewMapsValue): void;
}>();

function update(partial: Partial<PreviewMapsValue>) {
  emit("update:modelValue", { ...props.modelValue, ...partial });
}

const cachedMaps = ref<
  [MapWithMetadata | null, MapWithMetadata | null, MapWithMetadata | null]
>([null, null, null]);

let cacheInitialized = false;
watch(
  () => props.initialMaps,
  (maps) => {
    if (maps && !cacheInitialized) {
      cacheInitialized = true;
      cachedMaps.value = maps.map((m) => m as MapWithMetadata | null) as [
        MapWithMetadata | null,
        MapWithMetadata | null,
        MapWithMetadata | null,
      ];
    }
  },
  { immediate: true },
);

const pickMapModalRef = ref<InstanceType<typeof PickMapModal> | null>(null);

const slotKeys = ["map1", "map2", "map3"] as const;

async function openModal(i: 0 | 1 | 2) {
  const picked = await pickMapModalRef.value?.pick();
  if (!picked) return;
  cachedMaps.value[i] = picked;
  update({ [slotKeys[i]]: picked.code });
}
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <div v-for="(key, i) in slotKeys" :key="key">
      <div class="cursor-pointer" @click="openModal(i as 0 | 1 | 2)">
        <Btd6Map
          v-if="cachedMaps[i] || modelValue[key]"
          :map="cachedMaps[i] ?? undefined"
          :code="!cachedMaps[i] ? modelValue[key] : undefined"
          class="bg-(--color-contrast)! hover:bg-(--color-highlight)!"
        />
        <Btd6MapPlaceholder v-else />
      </div>

      <p v-if="errors?.[key]" class="text-(--color-danger) text-sm mt-1">
        {{ errors[key] }}
      </p>
    </div>
  </div>

  <PickMapModal ref="pickMapModalRef" :format-id="formatId" />
</template>
