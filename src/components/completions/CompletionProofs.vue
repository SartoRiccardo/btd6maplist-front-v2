<script setup lang="ts">
import { ref } from "vue";
import ImageLightbox from "@/components/common/ImageLightbox.vue";

defineProps<{
  submNotes: string | null;
  proofImages: string[];
  proofVideos: string[];
}>();

const lightbox = ref<InstanceType<typeof ImageLightbox>>();

function youtubeEmbedUrl(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (!match) return null;
  return `https://www.youtube.com/embed/${match[1]}`;
}
</script>

<template>
  <div>
    <div v-if="submNotes || $slots['notes-footer']" class="mb-6">
      <h3 class="font-['Luckiest_Guy'] text-xl mb-3">Submission Notes</h3>
      <p class="whitespace-pre-wrap">{{ submNotes }}</p>
      <slot name="notes-footer" />
    </div>

    <div v-if="proofImages.length > 0" class="mb-6">
      <h3 class="font-['Luckiest_Guy'] text-xl mb-3">Submission Images</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <img
          v-for="(src, i) in proofImages"
          :key="i"
          :src="src"
          alt="Submission proof"
          class="w-full rounded-(--radius-panel) object-cover cursor-zoom-in hover:opacity-80 transition-opacity"
          @click="lightbox?.show(src)"
        />
      </div>
    </div>

    <div v-if="proofVideos.length > 0" class="mb-6">
      <h3 class="font-['Luckiest_Guy'] text-xl mb-3">Submission Videos</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <template v-for="(url, i) in proofVideos" :key="i">
          <iframe
            v-if="youtubeEmbedUrl(url)"
            :src="youtubeEmbedUrl(url)!"
            class="w-full aspect-video rounded-(--radius-panel)"
            frameborder="0"
            allow="
              accelerometer;
              autoplay;
              clipboard-write;
              encrypted-media;
              gyroscope;
              picture-in-picture;
            "
            allowfullscreen
          />
          <a
            v-else
            :href="url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-(--color-highlight) underline break-all"
          >
            {{ url }}
          </a>
        </template>
      </div>
    </div>

    <ImageLightbox ref="lightbox" />
  </div>
</template>
