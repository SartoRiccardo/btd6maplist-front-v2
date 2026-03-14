<script setup lang="ts">
import type { MapCreator, MapVerification } from '@/services/api/maps/types';
import UserEntry from '@/components/users/UserEntry.vue';
import Icon from '@/components/common/Icon.vue';

defineProps<{
  creators: MapCreator[];
  verifications: MapVerification[];
  optimalHeros: string[] | null;
}>();
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
