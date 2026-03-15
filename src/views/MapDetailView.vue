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
import { permissions } from '@/constants/permissions';
import { useAuthStore } from '@/stores/auth';
import Btd6Map from '@/components/maps/Btd6Map.vue';
import LinkButton from '@/components/ui/LinkButton.vue';
import DiscordLoginButton from '@/components/navbar/DiscordLoginButton.vue';
import MapInfoPanel, { type FormatBadge } from '@/components/maps/MapInfoPanel.vue';
import StandaloneImage from '@/components/common/StandaloneImage.vue';
import CompletionList from '@/components/completions/CompletionList.vue';

const route = useRoute();
const auth = useAuthStore();
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

// --- Round 6 Start ---
const r6Start = computed(() => mapData.value?.r6_start ?? null);

const youtubeEmbedUrl = computed(() => {
  if (!r6Start.value) return null;
  const match = r6Start.value.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (!match) return null;
  return `https://www.youtube.com/embed/${match[1]}`;
});

const isR6Image = computed(() => r6Start.value != null && !youtubeEmbedUrl.value);

// --- Format badges ---
const formatBadges = computed<FormatBadge[]>(() => {
  const map = mapData.value;
  if (!map) return [];
  const visible = visibleFormatIds.value;
  const badges: FormatBadge[] = [];

  if (map.placement_curver != null && config.value && visible.includes(FORMAT_MAPLIST)) {
    const fmt = FORMAT_ICONS.find((f) => f.id === FORMAT_MAPLIST)!;
    const pts = calcMapPoints(map.placement_curver, config.value);
    badges.push({ icon: fmt.image, label: `#${map.placement_curver} — ${pts}pt`, slug: fmt.slug });
  }

  if (map.placement_allver != null && config.value && visible.includes(FORMAT_MAPLIST_ALL_VER)) {
    const fmt = FORMAT_ICONS.find((f) => f.id === FORMAT_MAPLIST_ALL_VER)!;
    const pts = calcMapPoints(map.placement_allver, config.value);
    badges.push({ icon: fmt.image, label: `#${map.placement_allver} — ${pts}pt`, slug: fmt.slug });
  }

  if (map.difficulty != null && visible.includes(FORMAT_EXPERT_LIST)) {
    const diff = EXPERT_DIFFICULTIES.find((d) => d.value === map.difficulty);
    const fmt = FORMAT_ICONS.find((f) => f.id === FORMAT_EXPERT_LIST)!;
    if (diff) badges.push({ icon: diff.image, label: `${diff.name} Expert`, slug: fmt.slug });
  }

  if (map.botb_difficulty != null && visible.includes(FORMAT_BEST_OF_THE_BEST)) {
    const diff = BOTB_DIFFICULTIES.find((d) => {
      const v = d.value;
      return Array.isArray(v) ? v.includes(map.botb_difficulty!) : v === map.botb_difficulty;
    });
    const fmt = FORMAT_ICONS.find((f) => f.id === FORMAT_BEST_OF_THE_BEST)!;
    if (diff) badges.push({ icon: diff.image, label: 'Best of the Best', slug: fmt.slug });
  }

  if (map.retro_map && visible.includes(FORMAT_NOSTALGIA_PACK)) {
    const fmt = FORMAT_ICONS.find((f) => f.id === FORMAT_NOSTALGIA_PACK)!;
    badges.push({ icon: map.retro_map.preview_url, label: map.retro_map.name, slug: fmt.slug, squareImage: true });
  }

  return badges;
});

// --- Admin actions ---
const canEditMap = computed(() => auth.hasPermission(permissions.map.edit));
const canEditCompletion = computed(() => auth.hasPermission(permissions.completion.edit));
const canCreateCompletion = computed(() => auth.hasPermission(permissions.completion.create));
const showSubmitCompletion = computed(() =>
  auth.hasPermission(permissions.completionSubmission.create)
);
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

    <div v-if="canEditMap" class="flex justify-center mb-2">
      <LinkButton :to="`/map/${code}/edit`">
        <i class="bi bi-pencil-fill mr-0.5" /> Edit Map
      </LinkButton>
    </div>

    <!-- Two-column layout -->
    <div class="flex flex-col md:flex-row gap-6 my-4">
      <!-- Left: Map preview -->
      <div class="w-full md:w-5/12">
        <Btd6Map :map="mapData" :code="mapData.code" :show-name="false" :btd6-version="config?.current_btd6_ver" show-play-button class="mb-0 mt-0" />
      </div>

      <!-- Right: Info panel -->
      <div class="flex-1">
        <MapInfoPanel
          :code="mapData.code"
          :creators="mapData.creators"
          :verifications="mapData.verifications"
          :optimal-heros="mapData.optimal_heros"
          :map-notes="mapData.map_notes"
          :format-badges="formatBadges"
        />
      </div>
    </div>

    <!-- Round 6 Start -->
    <div v-if="r6Start" class="my-6">
      <h2 class="text-center font-['Luckiest_Guy'] text-2xl mb-4">Round 6 Start</h2>
      <div v-if="youtubeEmbedUrl" class="flex justify-center">
        <iframe
          :src="youtubeEmbedUrl"
          class="w-full max-w-2xl aspect-video rounded-(--radius-panel)"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        />
      </div>
      <div v-else-if="isR6Image" class="flex justify-center">
        <StandaloneImage :src="r6Start!" alt="Round 6 Start" class="max-w-2xl" />
      </div>
    </div>

    <!-- My Completions -->
    <div v-if="auth.isAuthenticated && auth.user" class="my-6">
      <h2 class="text-center font-['Luckiest_Guy'] text-2xl mb-4">My Completions</h2>
      <div v-if="showSubmitCompletion" class="flex justify-center mb-4">
        <LinkButton :to="`/map/${code}/submit`">
          <i class="bi bi-trophy-fill mr-0.5" /> Submit Completion
        </LinkButton>
      </div>
      <CompletionList
        :params="{
          map_code: code,
          player_id: auth.user.discord_id,
          deleted: 'any',
          pending: 'any',
        }"
        :edit-url="canEditCompletion ? (id) => `/completions/${id}/edit` : undefined"
        empty-message="You haven't completed this map yet."
      />
    </div>
    <div v-else-if="!auth.isAuthenticated" class="my-6">
      <h2 class="text-center font-['Luckiest_Guy'] text-2xl mb-4">My Completions</h2>
      <div class="flex justify-center">
        <DiscordLoginButton text="Log in to submit completions" />
      </div>
    </div>

    <!-- Completions -->
    <div class="my-6">
      <h2 class="text-center font-['Luckiest_Guy'] text-2xl mb-4">Completions</h2>
      <CompletionList
        :params="{
          map_code: code,
          deleted: 'exclude',
          pending: 'exclude',
        }"
        :edit-url="canEditCompletion ? (id) => `/completions/${id}/edit` : undefined"
      />
      <div v-if="canCreateCompletion" class="flex justify-center mt-4">
        <LinkButton :to="`/map/${code}/insert-completion`">
          <i class="bi bi-plus-lg mr-0.5" /> Insert Completion
        </LinkButton>
      </div>
    </div>
  </div>
</template>
