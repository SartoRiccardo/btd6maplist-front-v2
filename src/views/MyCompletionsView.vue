<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import CompletionList from '@/components/completions/CompletionList.vue';
import LinkButton from '@/components/ui/LinkButton.vue';
import { formatDate } from '@/utils/dates';

const auth = useAuthStore();
</script>

<template>
  <div>
    <h1 class="font-['Luckiest_Guy'] text-3xl md:text-4xl text-center mt-6 mb-4">
      My Submissions
    </h1>

    <div class="flex justify-center gap-4 mb-4">
      <LinkButton to="/my-submissions/maps">
        Map Submissions
      </LinkButton>
      <LinkButton to="/my-submissions/completions" active>
        Completion Submissions
      </LinkButton>
    </div>

    <p class="text-center text-(--color-text-muted) mb-6">
      Here are your pending and rejected completions. Approved completions appear directly on your profile.
    </p>

    <CompletionList
      v-if="auth.user"
      :params="{
        player_id: auth.user.discord_id,
        pending: 'only',
        deleted: 'any',
      }"
      empty-message="No pending or rejected completions."
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
</template>
