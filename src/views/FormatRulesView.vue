<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useFormats } from '@/services/api/formats/queries';
import MarkdownContent from '@/components/common/MarkdownContent.vue';

const props = defineProps<{
  kind: 'map' | 'completion';
}>();

const route = useRoute();
const slug = computed(() => route.params['slug'] as string);
const { data: formats, isLoading } = useFormats();

const format = computed(() =>
  formats.value?.data.find((f) => f.slug === slug.value)
);

const title = computed(() => {
  if (!format.value) return '';
  const type = props.kind === 'map' ? 'Map' : 'Completion';
  return `${format.value.name} — ${type} Submission Rules`;
});

const rules = computed(() =>
  props.kind === 'map'
    ? format.value?.map_submission_rules
    : format.value?.completion_submission_rules
);
</script>

<template>
  <div>
    <div v-if="isLoading" class="text-center text-(--color-text-muted) my-6">Loading...</div>
    <div v-else-if="format">
      <h1 class="text-center font-['Luckiest_Guy'] text-3xl mt-6 mb-4">{{ title }}</h1>
      <MarkdownContent v-if="rules" :text="rules" />
      <p v-else class="text-center text-(--color-text-muted)">No rules published yet.</p>
    </div>
    <p v-else class="text-center text-(--color-text-muted) my-6">Format not found.</p>
  </div>
</template>
