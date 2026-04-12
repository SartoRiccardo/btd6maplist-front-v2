<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import Panel from "@/components/ui/Panel.vue";
import MapCodeInput, {
  type MapCodeValidation,
} from "@/components/maps/MapCodeInput.vue";

const route = useRoute();

// --- Query params ---

const codeInput = ref(
  typeof route.query["code"] === "string" ? route.query["code"] : "",
);

const creatorId = computed(() => {
  const val = route.query["creator_id"];
  return typeof val === "string" ? val : null;
});

const proposedDifficulty = computed(() => {
  const val = route.query["proposed_difficulty"];
  return val ? Number(val) : null;
});

const formatId = computed(() => {
  const val = route.query["format"];
  return val ? Number(val) : null;
});

// --- Map code validation ---

const validation = ref<MapCodeValidation>({
  nkMap: null,
  nkError: null,
  nkLoading: false,
  maplistMap: null,
  maplistLoading: false,
  isCodeValid: false,
});

const nkMap = computed(() => validation.value.nkMap);
const isCodeValid = computed(() => validation.value.isCodeValid);
</script>

<template>
  <div>
    <h1 class="font-['Luckiest_Guy'] text-3xl text-center mb-6">New Map</h1>

    <!-- Map Code + Preview row -->
    <div
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 items-stretch"
    >
      <!-- Left: Code input panel -->
      <Panel class="sm:col-span-1 lg:col-span-2 flex flex-col">
        <MapCodeInput v-model="codeInput" @validation="validation = $event" />
      </Panel>

      <!-- Right: Map preview -->
      <div>
        <div
          v-if="nkMap"
          class="relative p-[0.4rem] pb-4 rounded-(--radius-panel) shadow-md bg-(--color-secondary)"
        >
          <p
            class="absolute top-[-0.7rem] left-[-0.1rem] w-full text-center font-['Luckiest_Guy'] font-border text-base md:text-2xl break-words z-10"
          >
            {{ nkMap.name }}
          </p>
          <img
            class="w-full h-auto aspect-[3/2] bg-(--color-primary) block rounded-sm"
            :src="nkMap.mapURL"
            alt=""
          />
        </div>
        <div
          v-else
          class="p-[0.4rem] pb-4 rounded-(--radius-panel) shadow-md bg-(--color-secondary)"
        >
          <div
            class="w-full aspect-[3/2] bg-(--color-primary) rounded-sm animate-pulse"
          />
        </div>
      </div>
    </div>

    <!-- Form skeleton (shown when code is valid) -->
    <Panel v-if="isCodeValid">
      <!-- Form fields will go here -->
    </Panel>
  </div>
</template>
