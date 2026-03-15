<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import CompletionList from '@/components/completions/CompletionList.vue';
import { formatDate } from '@/utils/dates';

const route = useRoute();
const userId = computed(() => route.params['id'] as string);
</script>

<template>
  <div>
    <!-- Completions -->
    <div class="my-6">
      <h2 class="font-['Luckiest_Guy'] text-2xl text-center mb-4">Completions</h2>
      <CompletionList
        :params="{
          player_id: userId,
          deleted: 'exclude',
          pending: 'exclude',
        }"
        empty-message="No completions yet."
      >
        <template #default="{ completion }">
          <RouterLink
            :to="`/map/${completion.map.code}`"
            class="no-underline! text-(--color-text)! hover:text-(--color-active)!"
          >
            <div class="flex items-center gap-3">
              <img
                class="w-16 h-auto aspect-[3/2] bg-(--color-primary) rounded-sm shrink-0"
                :src="completion.map.map_preview_url"
                alt=""
                loading="lazy"
              />
              <div>
                <span class="font-['Luckiest_Guy'] font-border text-base">
                  {{ completion.map.name }}
                </span>
                <p class="text-sm text-(--color-text-muted) mb-0">
                  {{ formatDate(completion.submitted_on) }}
                </p>
              </div>
            </div>
          </RouterLink>
        </template>
      </CompletionList>
    </div>
  </div>
</template>
