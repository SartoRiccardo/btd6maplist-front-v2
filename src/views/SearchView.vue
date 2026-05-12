<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSearch } from "@/services/api/search/queries";
import MapGrid from "@/components/maps/MapGrid.vue";
import MapFormatBadges from "@/components/maps/MapFormatBadges.vue";
import UserEntry from "@/components/users/UserEntry.vue";
import type { SearchParams } from "@/services/api/search/types";

const route = useRoute();
const router = useRouter();

const inputValue = ref("");
const submittedParams = ref<SearchParams | null>(null);

watch(
  () => route.query["q"],
  (q) => {
    const val = typeof q === "string" ? q.trim() : "";
    inputValue.value = val;
    submittedParams.value = val.length >= 3 ? { q: val } : null;
  },
  { immediate: true },
);

const { data: results, isFetching } = useSearch(submittedParams);

const maps = computed(
  () => results.value?.filter((r) => r.type === "map").map((r) => r.result) ?? [],
);
const users = computed(
  () => results.value?.filter((r) => r.type === "user").map((r) => r.result) ?? [],
);

const hasResults = computed(() => results.value !== undefined);

function handleSubmit() {
  const q = inputValue.value.trim();
  if (q.length < 3) return;
  router.push({ query: { q } });
}
</script>

<template>
  <div>
    <h1 class="font-['Luckiest_Guy'] text-3xl md:text-4xl text-center mt-6 mb-4">
      Search Maps or Users
    </h1>

    <form class="flex gap-2 mb-6" @submit.prevent="handleSubmit">
      <input
        v-model="inputValue"
        type="text"
        placeholder="Search..."
        :disabled="isFetching"
        class="flex-1 px-3 py-1.5 rounded-(--radius-btn) bg-(--color-primary) text-(--color-text) border border-(--color-contrast) focus:outline-none focus:border-(--color-active) disabled:opacity-50"
      />
      <button
        type="submit"
        :disabled="isFetching || inputValue.trim().length < 3"
        class="bg-(--color-highlight) text-(--color-text) px-4 py-1.5 rounded-(--radius-btn) transition-[filter] duration-150 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        aria-label="Search"
      >
        <i class="bi bi-caret-right-fill"></i>
      </button>
    </form>

    <p v-if="isFetching" class="text-center text-(--color-text-muted)">
      Searching...
    </p>

    <template v-else-if="hasResults">
      <template v-if="maps.length">
        <h2 class="font-['Luckiest_Guy'] text-2xl mt-12 mb-1 text-center">Maps</h2>
        <hr class="border-(--color-contrast) mb-4" />
        <MapGrid :maps="maps">
          <template #bottom="{ map }">
            <MapFormatBadges :map="map" />
          </template>
        </MapGrid>
      </template>

      <template v-if="users.length">
        <h2 class="font-['Luckiest_Guy'] text-2xl mt-12 mb-1 text-center">Users</h2>
        <hr class="border-(--color-contrast) mb-4" />
        <div
          v-for="user in users"
          :key="user.discord_id"
          class="bg-(--color-secondary) rounded-(--radius-panel) my-2 py-2 px-3"
        >
          <UserEntry :user="user" :centered="true" :text-size="'lg'" />
        </div>
      </template>

      <p v-if="!maps.length && !users.length" class="text-center text-(--color-text-muted)">
        No results found.
      </p>
    </template>
  </div>
</template>
