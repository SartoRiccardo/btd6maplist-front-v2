<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useFormats } from '@/services/api/formats/queries';
import { FORMAT_ICONS } from '@/constants/formats';
import IconSelector from '@/components/ui/IconSelector.vue';
import MarkdownContent from '@/components/common/MarkdownContent.vue';

const props = defineProps<{
  kind: 'map' | 'completion';
}>();

const route = useRoute();
const router = useRouter();
const { data: formats, isLoading } = useFormats();

const visibleFormats = computed(() => {
  if (!formats.value) return [];
  const statusKey = props.kind === 'map' ? 'map_submission_status' : 'run_submission_status';
  return formats.value.data
    .filter((f) => !f.hidden && f[statusKey] !== 'closed')
    .map((f) => {
      const icon = FORMAT_ICONS.find((fi) => fi.id === f.id);
      return { ...f, image: icon?.image ?? '' };
    })
    .filter((f) => f.image);
});

const formatOptions = computed(() =>
  visibleFormats.value.map((f) => ({
    key: f.slug,
    name: f.name,
    image: f.image,
  }))
);

const selectedSlug = computed(() => route.params['slug'] as string);

const format = computed(() =>
  visibleFormats.value.find((f) => f.slug === selectedSlug.value)
);

watch(visibleFormats, (fmts) => {
  if (!fmts.length) return;
  const first = fmts[0];
  if (first && !fmts.some((f) => f.slug === selectedSlug.value)) {
    const routeName = props.kind === 'map' ? 'MapSubmissionRules' : 'CompletionSubmissionRules';
    router.replace({ name: routeName, params: { slug: first.slug } });
  }
}, { immediate: true });

function onFormatChange(slug: string) {
  const routeName = props.kind === 'map' ? 'MapSubmissionRules' : 'CompletionSubmissionRules';
  router.replace({ name: routeName, params: { slug } });
}

const title = computed(() => {
  const type = props.kind === 'map' ? 'Map' : 'Completion';
  return `${type} Submission Rules`;
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
    <template v-else>
      <h1 class="text-center font-['Luckiest_Guy'] text-3xl mt-6 mb-4">{{ title }}</h1>

      <IconSelector
        :options="formatOptions"
        :model-value="selectedSlug"
        @update:model-value="onFormatChange"
      />

      <div v-if="format" class="mt-6">
        <MarkdownContent v-if="rules" :text="rules" />
        <p v-else class="text-center text-(--color-text-muted)">No rules published yet.</p>
      </div>
      <p v-else class="text-center text-(--color-text-muted) mt-6">Format not found.</p>
    </template>
  </div>
</template>
