<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useMap } from '@/services/api/maps/queries';
import { useConfig } from '@/services/api/config/queries';
import { useFormats } from '@/services/api/formats/queries';
import { calcMapPoints } from '@/utils/points';
import {
  FORMAT_MAPLIST,
  FORMAT_MAPLIST_ALL_VER,
  FORMAT_EXPERT_LIST,
  FORMAT_BEST_OF_THE_BEST,
  FORMAT_NOSTALGIA_PACK,
  FORMAT_ICONS,
} from '@/constants/formats';
import { EXPERT_DIFFICULTIES, BOTB_DIFFICULTIES } from '@/constants/difficulties';
import Btd6Map from '@/components/maps/Btd6Map.vue';
import MapInfoPanel from '@/components/maps/MapInfoPanel.vue';

const route = useRoute();
const code = computed(() => route.params['code'] as string);

const { data: mapData } = useMap(code, { include: 'creators.flair,verifiers.flair' });
const { data: config } = useConfig();
const { data: formatsResponse } = useFormats();

const visibleFormatIds = computed(() =>
  formatsResponse.value?.data
    .filter((f) => !f.hidden)
    .map((f) => f.id) ?? []
);

// --- Copy to clipboard ---
const copied = ref(false);
let copyTimeout: ReturnType<typeof setTimeout> | undefined;

function copyCode() {
  if (!mapData.value) return;
  navigator.clipboard.writeText(mapData.value.code);
  copied.value = true;
  clearTimeout(copyTimeout);
  copyTimeout = setTimeout(() => { copied.value = false; }, 2000);
}

// --- Format badge helpers ---
const maplistPlacement = computed(() => {
  if (!mapData.value || !config.value) return null;
  if (mapData.value.placement_curver == null) return null;
  if (!visibleFormatIds.value.includes(FORMAT_MAPLIST)) return null;
  const p = mapData.value.placement_curver;
  return { placement: p, points: calcMapPoints(p, config.value), icon: FORMAT_ICONS.find((f) => f.id === FORMAT_MAPLIST)! };
});

const allverPlacement = computed(() => {
  if (!mapData.value || !config.value) return null;
  if (mapData.value.placement_allver == null) return null;
  if (!visibleFormatIds.value.includes(FORMAT_MAPLIST_ALL_VER)) return null;
  const p = mapData.value.placement_allver;
  return { placement: p, points: calcMapPoints(p, config.value), icon: FORMAT_ICONS.find((f) => f.id === FORMAT_MAPLIST_ALL_VER)! };
});

const expertDifficulty = computed(() => {
  if (!mapData.value || mapData.value.difficulty == null) return null;
  if (!visibleFormatIds.value.includes(FORMAT_EXPERT_LIST)) return null;
  return EXPERT_DIFFICULTIES.find((d) => d.value === mapData.value!.difficulty) ?? null;
});

const botbDifficulty = computed(() => {
  if (!mapData.value || mapData.value.botb_difficulty == null) return null;
  if (!visibleFormatIds.value.includes(FORMAT_BEST_OF_THE_BEST)) return null;
  return BOTB_DIFFICULTIES.find((d) => {
    const v = d.value;
    return Array.isArray(v) ? v.includes(mapData.value!.botb_difficulty!) : v === mapData.value!.botb_difficulty;
  }) ?? null;
});

const nostalgiaInfo = computed(() => {
  if (!mapData.value || !mapData.value.retro_map) return null;
  if (!visibleFormatIds.value.includes(FORMAT_NOSTALGIA_PACK)) return null;
  return mapData.value.retro_map;
});
</script>

<template>
  <div v-if="mapData">
    <!-- Title -->
    <h1 class="text-center font-['Luckiest_Guy'] text-3xl md:text-4xl mt-6 mb-2">
      {{ mapData.name }}
    </h1>

    <!-- Aliases -->
    <p v-if="mapData.aliases.length > 0" class="text-center text-(--color-text-muted) mb-2">
      <template v-for="(alias, i) in mapData.aliases" :key="alias">
        <template v-if="i !== 0">, </template>
        <span class="font-mono">{{ alias }}</span>
      </template>
    </p>

    <!-- Code + Copy -->
    <p class="text-center text-lg mb-6">
      Code: <span class="underline">{{ mapData.code }}</span>
      <button
        class="ml-2 text-(--color-highlight) hover:text-(--color-highlight) transition-colors duration-150 cursor-pointer bg-transparent border-none p-0"
        @click="copyCode"
      >
        <i v-if="!copied" class="bi bi-copy text-(--color-highlight)" />
        <i v-else class="bi bi-check2 text-(--color-highlight)" />
      </button>
    </p>

    <!-- Two-column layout -->
    <div class="flex flex-col md:flex-row gap-6 my-4">
      <!-- Left: Map preview -->
      <div class="w-full md:w-5/12">
        <Btd6Map :map="mapData" :code="mapData.code" :show-name="false" show-play-button class="mb-0 mt-0">
          <template #badge>
            <!-- Maplist placement badge -->
            <div
              v-if="maplistPlacement"
              class="absolute top-[7%] left-[-4%] bg-(--color-contrast) shadow-[0_0_0.5rem_black] rounded-full
                     flex items-center gap-1 px-2 py-1 z-10"
            >
              <img :src="maplistPlacement.icon.image" alt="" class="h-6 w-6" />
              <span class="font-['Luckiest_Guy'] font-border text-sm">
                #{{ maplistPlacement.placement }} — {{ maplistPlacement.points }}pt
              </span>
            </div>

            <!-- All Versions placement badge -->
            <div
              v-if="allverPlacement"
              class="absolute left-[-4%] bg-(--color-contrast) shadow-[0_0_0.5rem_black] rounded-full
                     flex items-center gap-1 px-2 py-1 z-10"
              :class="maplistPlacement ? 'top-[28%]' : 'top-[7%]'"
            >
              <img :src="allverPlacement.icon.image" alt="" class="h-6 w-6" />
              <span class="font-['Luckiest_Guy'] font-border text-sm">
                #{{ allverPlacement.placement }} — {{ allverPlacement.points }}pt
              </span>
            </div>

            <!-- Expert List badge -->
            <div
              v-if="expertDifficulty"
              class="absolute left-[-4%] bg-(--color-contrast) shadow-[0_0_0.5rem_black] rounded
                     flex items-center gap-1 px-2 py-1 z-10"
              :class="maplistPlacement || allverPlacement ? 'top-[49%]' : 'top-[7%]'"
            >
              <img :src="expertDifficulty.image" alt="" class="h-6 w-6" />
              <span class="font-['Luckiest_Guy'] font-border text-sm">
                {{ expertDifficulty.name }} Expert
              </span>
            </div>

            <!-- BotB badge -->
            <div
              v-if="botbDifficulty"
              class="absolute left-[-4%] bg-(--color-contrast) shadow-[0_0_0.5rem_black] rounded
                     flex items-center gap-1 px-2 py-1 z-10"
              :class="maplistPlacement || allverPlacement || expertDifficulty ? 'top-[70%]' : 'top-[7%]'"
            >
              <img :src="botbDifficulty.image" alt="" class="h-6 w-6" />
              <span class="font-['Luckiest_Guy'] font-border text-sm">
                Best of the Best
              </span>
            </div>

            <!-- Nostalgia Pack badge -->
            <div
              v-if="nostalgiaInfo"
              class="absolute left-[-4%] bg-(--color-contrast) shadow-[0_0_0.5rem_black] rounded
                     flex items-center gap-1 px-2 py-1 z-10"
              :class="maplistPlacement || allverPlacement || expertDifficulty || botbDifficulty ? 'top-[70%]' : 'top-[7%]'"
            >
              <img :src="nostalgiaInfo.preview_url" alt="" class="h-8 w-8 rounded-sm" />
              <span class="font-['Luckiest_Guy'] font-border text-sm">
                {{ nostalgiaInfo.name }}
              </span>
            </div>
          </template>
        </Btd6Map>
      </div>

      <!-- Right: Info panel -->
      <div class="flex-1">
        <MapInfoPanel
          :creators="mapData.creators"
          :verifications="mapData.verifications"
          :optimal-heros="mapData.optimal_heros"
        />
      </div>
    </div>
  </div>
</template>
