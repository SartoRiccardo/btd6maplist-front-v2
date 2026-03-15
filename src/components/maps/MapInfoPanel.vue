<script setup lang="ts">
import { computed } from 'vue';
import type { MapCreator, MapVerification } from '@/services/api/maps/types';
import type { User } from '@/services/api/users/types';
import { useNKMapCreator } from '@/composables/useNKMapCreator';
import LinkButton from '@/components/ui/LinkButton.vue';
import UserEntry from '@/components/users/UserEntry.vue';
import UserEntrySkeleton from '@/components/users/UserEntrySkeleton.vue';
import Badge from '@/components/common/Badge.vue';
import Icon from '@/components/common/Icon.vue';
import { heroId } from '@/utils/heroes';
import MarkdownContent from '@/components/common/MarkdownContent.vue';
import type { FormatBadge } from '@/utils/formatBadges';

const props = defineProps<{
  code: string;
  creators: MapCreator[];
  verifications: MapVerification[];
  optimalHeros: string[] | null;
  mapNotes: string | null;
  formatBadges: FormatBadge[];
}>();

const noCreators = computed(() => props.creators.length === 0);
const { creatorName: nkCreatorName, creatorAvatar: nkCreatorAvatar, isLoading: nkLoading } = useNKMapCreator(
  () => props.code,
  noCreators,
);

const nkSyntheticUser = computed<User | null>(() => {
  if (!nkCreatorName.value) return null;
  return {
    discord_id: '',
    name: nkCreatorName.value,
    is_banned: false,
    platform_roles: [],
    avatar_url: nkCreatorAvatar.value,
  };
});
</script>

<template>
  <div class="bg-(--color-secondary) rounded-(--radius-panel) p-4 shadow-md h-full">
    <!-- Format Badges -->
    <div v-if="formatBadges.length > 0" class="flex flex-wrap gap-2 mb-4">
      <LinkButton
        v-for="badge in formatBadges"
        :key="badge.label"
        :to="badge.slug ? `/maps/${badge.slug}` : ''"
      >
        <span class="flex items-center gap-2">
          <img
            v-if="badge.squareImage"
            :src="badge.icon"
            alt=""
            class="h-8 w-8 rounded-sm object-cover"
          />
          <Badge v-else :src="badge.icon" alt="" class="translate-y-0 scale-[125%]" />
          <span class="font-['Luckiest_Guy'] font-border text-sm">
            {{ badge.label }}
          </span>
        </span>
      </LinkButton>
    </div>

    <!-- Creators & Verifiers -->
    <div class="flex flex-col sm:flex-row gap-4 mb-4">
      <div class="flex-1">
        <h3 class="font-['Luckiest_Guy'] text-xl mb-2">
          Creator{{ creators.length > 1 ? 's' : '' }}
        </h3>
        <template v-if="creators.length > 0">
          <UserEntry
            v-for="creator in creators"
            :key="creator.user_id"
            :user="creator.user"
            :label="creator.role ?? undefined"
          />
        </template>
        <UserEntry
          v-else-if="nkSyntheticUser"
          :user="nkSyntheticUser"
          label="This user does not have a BTD6 Maplist account"
          no-link
        />
        <UserEntrySkeleton v-else-if="nkLoading" />
        <p v-else class="text-(--color-text-muted) text-sm">
          Unknown creator
        </p>
      </div>

      <div class="flex-1">
        <h3 class="font-['Luckiest_Guy'] text-xl mb-2">
          Verifier{{ verifications.length > 1 ? 's' : '' }}
        </h3>
        <UserEntry
          v-for="verification in verifications"
          :key="verification.user_id"
          :user="verification.user"
          :label="verification.version ? 'Current version' : undefined"
        />
      </div>
    </div>

    <!-- Optimal Heroes -->
    <div v-if="optimalHeros && optimalHeros.length > 0" class="flex flex-wrap items-center gap-2 pt-4">
      <h3 class="font-['Luckiest_Guy'] text-xl mb-0 mr-2">
        Optimal Hero{{ optimalHeros.length > 1 ? 's' : '' }}
      </h3>
      <Icon
        v-for="hero in optimalHeros"
        :key="hero"
        :src="`/images/heros/hero_${heroId(hero)}.webp`"
        :alt="hero"
        class="mx-2.5 scale-[250%] -translate-1"
      />
    </div>

    <!-- Map Notes -->
    <div v-if="mapNotes" class="pt-4">
      <h3 class="font-['Luckiest_Guy'] text-xl mb-2">Map Notes</h3>
      <MarkdownContent :text="mapNotes" />
    </div>
  </div>
</template>
