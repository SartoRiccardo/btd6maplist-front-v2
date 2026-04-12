<script setup lang="ts">
import { ref } from "vue";
import BoxedCheckbox from "@/components/ui/BoxedCheckbox.vue";
import Button from "@/components/ui/Button.vue";
import {
  HEROES,
  heroImageUrl,
  heroDisplayName,
  type Hero,
} from "@/constants/heroes";

const props = defineProps<{
  modelValue: string[];
  disabled?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string[]];
}>();

const noOptimalHero = ref(props.modelValue.length === 0);
let cachedHeroes: string[] = [];

function toggleNoOptimal(checked: boolean) {
  noOptimalHero.value = checked;
  if (checked) {
    cachedHeroes = [...props.modelValue];
    emit("update:modelValue", []);
  } else {
    emit("update:modelValue", [...cachedHeroes]);
  }
}

function toggleHero(hero: Hero) {
  if (noOptimalHero.value) return;
  const current = props.modelValue;
  const next = current.includes(hero)
    ? current.filter((h) => h !== hero)
    : [...current, hero];
  emit("update:modelValue", next);
}
</script>

<template>
  <div>
    <BoxedCheckbox
      :model-value="noOptimalHero"
      :disabled="disabled"
      label="This map has no optimal hero"
      @update:model-value="toggleNoOptimal"
    />

    <div
      v-if="!noOptimalHero"
      class="flex flex-wrap justify-center gap-1.5 mt-3"
    >
      <Button
        v-for="hero in HEROES"
        :key="hero"
        :active="modelValue.includes(hero)"
        :disabled="disabled"
        :title="heroDisplayName(hero)"
        class="!p-1"
        @click="toggleHero(hero)"
      >
        <img
          :src="heroImageUrl(hero)"
          :alt="heroDisplayName(hero)"
          class="w-16 h-16 rounded-sm"
          :class="{ 'grayscale opacity-60': !modelValue.includes(hero) }"
        />
      </Button>
    </div>
  </div>
</template>
