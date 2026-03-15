<script setup lang="ts">
import { computed } from 'vue';
import type { CompletionDetail } from '@/services/api/completions/types';
import type { User } from '@/services/api/users/types';
import UserEntry from '@/components/users/UserEntry.vue';

const props = defineProps<{
  completion: CompletionDetail;
}>();

const acceptedByUser = computed<User | null>(() => {
  const ab = props.completion.accepted_by;
  if (ab != null && typeof ab === 'object') return ab;
  return null;
});

function youtubeEmbedUrl(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (!match) return null;
  return `https://www.youtube.com/embed/${match[1]}`;
}
</script>

<template>
  <div>
    <!-- Submission notes + approved by -->
    <div v-if="completion.subm_notes || acceptedByUser" class="mb-6">
      <h3 class="font-['Luckiest_Guy'] text-xl mb-3">Submission Notes</h3>
      <p v-if="completion.subm_notes" class="whitespace-pre-wrap">{{ completion.subm_notes }}</p>
      <p v-if="acceptedByUser" class="text-(--color-text-muted) mt-2 ml-4 italic flex items-center">
        <span class="mr-1">Completion approved by</span>
        <UserEntry :user="acceptedByUser" inline class="ml-2" />
      </p>
    </div>

    <!-- Submission Images -->
    <div v-if="completion.subm_proof_img.length > 0" class="mb-6">
      <h3 class="font-['Luckiest_Guy'] text-xl mb-3">Submission Images</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <img
          v-for="(src, i) in completion.subm_proof_img"
          :key="i"
          :src="src"
          alt="Submission proof"
          class="w-full rounded-(--radius-panel) object-cover"
        />
      </div>
    </div>

    <!-- Submission Videos -->
    <div v-if="completion.subm_proof_vid.length > 0">
      <h3 class="font-['Luckiest_Guy'] text-xl mb-3">Submission Videos</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <template v-for="(url, i) in completion.subm_proof_vid" :key="i">
          <iframe
            v-if="youtubeEmbedUrl(url)"
            :src="youtubeEmbedUrl(url)!"
            class="w-full aspect-video rounded-(--radius-panel)"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          />
          <a v-else :href="url" target="_blank" rel="noopener noreferrer" class="text-(--color-highlight) underline break-all">
            {{ url }}
          </a>
        </template>
      </div>
    </div>
  </div>
</template>
