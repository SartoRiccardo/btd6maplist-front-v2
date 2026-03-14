<script setup lang="ts">
import { computed } from 'vue';
import type { MapCreator, MapVerification } from '@/services/api/maps/types';
import type { User } from '@/services/api/users/types';
import { useNKMapCreator } from '@/composables/useNKMapCreator';
import UserEntry from '@/components/users/UserEntry.vue';
import UserEntrySkeleton from '@/components/users/UserEntrySkeleton.vue';
import Icon from '@/components/common/Icon.vue';

const props = defineProps<{
  code: string;
  creators: MapCreator[];
  verifications: MapVerification[];
  optimalHeros: string[] | null;
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
        :src="`/images/heros/hero_${hero.toLowerCase().replace(/ /g, '_')}.webp`"
        :alt="hero"
        class="mx-2.5 scale-[250%] -translate-1"
      />
    </div>
  </div>
</template>
