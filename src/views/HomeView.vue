<script setup lang="ts">
import { computed } from 'vue';
import { useFormats } from '@/services/api/formats/queries';
import FormatSection from '@/components/home/FormatSection.vue';
import UserEntry from '@/components/users/UserEntry.vue';

const { data: formats } = useFormats();

const visibleFormats = computed(() =>
  formats.value?.data.filter((f) => !f.hidden) ?? []
);

const DEFAULT_HERO = '/images/list_icons/hero_maplist.png';
const DEFAULT_ICON = '/images/list_icons/icon_curver.webp';

const FORMAT_HEROES: Partial<Record<number, string>> = {
  1: '/images/list_icons/hero_maplist.png',
  51: '/images/list_icons/hero_expert_list.png',
  52: '/images/list_icons/hero_best_of_the_best.png',
  11: '/images/list_icons/hero_nostalgia_pack.png',
};

const FORMAT_ICONS: Partial<Record<number, string>> = {
  1: '/images/list_icons/icon_curver.webp',
  51: '/images/list_icons/icon_hard.webp',
  52: '/images/list_icons/icon_botb.png',
  11: '/images/list_icons/icon_np_1.png',
};

function formatHero(id: number): string {
  return FORMAT_HEROES[id] ?? DEFAULT_HERO;
}

function formatIcon(id: number): string {
  return FORMAT_ICONS[id] ?? DEFAULT_ICON;
}
</script>

<template>
  <div class="text-center">
    <h1 class="font-['Luckiest_Guy'] text-4xl md:text-5xl mt-4">Bloons TD 6 Maplist</h1>
    <p class="text-lg px-4 md:px-12 mt-3 mb-3">
      The BTD6 Maplist showcases a collection of challenging custom maps for
      Bloons TD 6, created by the community. These maps range from cleverly
      designed to incredibly difficult, offering a variety of experiences for
      players looking to test their tower defense skills.
    </p>
    <div class="text-sm mb-6">
      <a href="https://www.youtube.com/@btd6maplist" target="_blank">YouTube</a>
      {{ " | " }}
      <a href="https://github.com/stars/SartoRiccardo/lists/btd6-maplist" target="_blank">GitHub</a>
    </div>

    <!-- Format Sections -->
    <div v-if="formats">
      <FormatSection
        v-for="(fmt, index) in visibleFormats"
        :key="fmt.id"
        :format="fmt"
        :hero-url="formatHero(fmt.id)"
        :icon-url="formatIcon(fmt.id)"
        :inverted="index % 2 !== 0"
        :bordered="index < visibleFormats.length - 1"
      />
    </div>

    <!-- Credits -->
    <hr class="my-10 border-(--color-secondary)" />
    <div class="text-left px-4">
      <p class="mb-5">Special thanks to:</p>
      <ul class="list-disc pl-6 space-y-2">
        <li>
          The Geometry Dash Demon List, which was the primary inspiration
          behind this project, as well as smaller projects like the 2 Player
          List and Insane Demon List.
        </li>
        <li>
          <span class="inline-block">
            <UserEntry id="508409944736006154" :centered="true" :inline="true" />
          </span>
          for helping to set up the Discord server and designing the project's icon
        </li>
        <li>
          <span class="inline-block">
            <UserEntry id="1077309729942024302" :centered="true" :inline="true" />
          </span>
          for making and hosting both the website and the Discord bot
        </li>
      </ul>
    </div>
  </div>
</template>
