<script setup lang="ts">
import { computed } from "vue";
import type { Completion } from "@/services/api/completions/types";
import type { MapWithMetadata } from "@/services/api/maps/types";
import { FORMAT_ICONS } from "@/constants/formats";
import { FORMAT_DIFFICULTIES } from "@/constants/difficulties";
import { useFormats } from "@/services/api/formats/queries";
import { useAuthStore } from "@/stores/auth";
import { heroId } from "@/utils/heroes";
import { RouterLink } from "vue-router";
import { useDeleteAdminNote } from "@/services/api/completions/queries";
import Badge from "@/components/common/Badge.vue";
import Button from "@/components/ui/Button.vue";
import Tooltip from "@/components/ui/Tooltip.vue";
import CompletionAdminNote from "@/components/completions/CompletionAdminNote.vue";

const props = defineProps<{
  completion: Completion;
  expanded?: boolean;
  editUrl?: string;
  mapDisplay?: "hidden" | "minimal" | "detail";
}>();

const emit = defineEmits<{
  toggleDetail: [];
}>();

const auth = useAuthStore();
const { data: formats } = useFormats();
const { mutateAsync: deleteAdminNote } = useDeleteAdminNote();

const hideNoGeraldo = computed(() => {
  const fmt = formats.value?.data.find(
    (f) => f.id === props.completion.format_id,
  );
  return fmt?.is_no_geraldo_enabled === false;
});

const formatInfo = computed(() =>
  FORMAT_ICONS.find((f) => f.id === props.completion.format_id),
);

const showEdit = computed(
  () =>
    props.editUrl != null &&
    !props.completion.players.some(
      (p) => p.discord_id === auth.user?.discord_id,
    ),
);

const isDeleted = computed(() => props.completion.deleted_on != null);
const isPending = computed(() => props.completion.accepted_by == null);

const statusPill = computed(() => {
  if (isDeleted.value && isPending.value)
    return { label: "Rejected", class: "bg-(--color-deleted)" };
  if (isDeleted.value)
    return { label: "Deleted", class: "bg-(--color-deleted)" };
  if (isPending.value)
    return { label: "Pending", class: "bg-(--color-pending)" };
  return null;
});

const mapMeta = computed(() => {
  if (props.mapDisplay !== "detail") return null;
  return props.completion.map as unknown as MapWithMetadata;
});

const difficultyInfo = computed(() => {
  if (!mapMeta.value || mapMeta.value.difficulty == null) return null;
  const difficulties = FORMAT_DIFFICULTIES[props.completion.format_id];
  if (!difficulties) return null;
  const val = mapMeta.value.difficulty;
  return (
    difficulties.find((d) =>
      Array.isArray(d.value) ? d.value.includes(val) : d.value === val,
    ) ?? null
  );
});
</script>

<template>
  <div
    class="bg-(--color-secondary) rounded-(--radius-panel) my-2 py-2 px-3 relative"
  >
    <span
      v-if="statusPill"
      class="absolute top-[-0.5rem] left-[-0.5rem] text-xs font-bold px-2 py-0.5 rounded text-white z-10 opacity-100!"
      :class="statusPill.class"
    >
      {{ statusPill.label }}
    </span>

    <!-- Map header -->
    <RouterLink
      v-if="mapDisplay && mapDisplay !== 'hidden'"
      :to="`/map/${completion.map.code}`"
      class="no-underline! text-(--color-text)! hover:text-(--color-active)! flex items-center mb-2"
    >
      <img
        class="w-24 h-auto aspect-[3/2] bg-(--color-primary) rounded-sm shrink-0"
        :src="completion.map.map_preview_url"
        alt=""
        loading="lazy"
      />
      <div class="pl-3">
        <p class="mb-0 font-['Luckiest_Guy'] font-border text-lg">
          {{ completion.map.name }}
        </p>
        <div
          v-if="
            mapDisplay === 'detail' &&
            (difficultyInfo || mapMeta?.optimal_heros?.length)
          "
          class="flex items-center gap-1.5 mt-0.5 text-sm text-(--color-text-muted)"
        >
          <template v-if="difficultyInfo">
            <Badge :src="difficultyInfo.image" :alt="difficultyInfo.name" />
            {{ difficultyInfo.name }}
            <template v-if="mapMeta?.optimal_heros?.length"
              >&mdash;&nbsp;</template
            >
          </template>
          <img
            v-for="hero in mapMeta?.optimal_heros"
            :key="hero"
            :src="`/images/heros/hero_${heroId(hero)}.webp`"
            :alt="hero"
            class="w-[18px] h-[18px] scale-150 mx-0.5"
          />
        </div>
      </div>
    </RouterLink>

    <!-- Large screens: grid with fixed columns for medals/format/button -->
    <div
      class="hidden md:grid items-center gap-2"
      style="grid-template-columns: 1fr 19rem auto"
    >
      <!-- Slot -->
      <div class="min-w-0">
        <slot />
      </div>

      <!-- Medals -->
      <div>
        <slot name="medals">
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-2">
              <Tooltip
                :text="completion.black_border ? 'Black Border' : 'CHIMPS'"
              >
                <img
                  :src="
                    completion.black_border
                      ? '/images/medals/medal_bb.webp'
                      : '/images/medals/medal_win.webp'
                  "
                  class="w-[40px] h-[40px]"
                />
              </Tooltip>
              <Tooltip text="No Optimal Hero" :disabled="hideNoGeraldo">
                <img
                  src="/images/medals/medal_nogerry.webp"
                  class="w-[40px] h-[40px]"
                  :class="
                    hideNoGeraldo
                      ? 'opacity-0'
                      : { 'medal-blocked': !completion.no_geraldo }
                  "
                />
              </Tooltip>
              <Tooltip
                text="Current LCC"
                :disabled="!completion.is_current_lcc"
              >
                <img
                  src="/images/medals/medal_lcc.webp"
                  class="w-[40px] h-[40px]"
                  :class="completion.is_current_lcc ? '' : 'opacity-0'"
                />
              </Tooltip>
            </div>
            <div v-if="formatInfo" class="flex items-center gap-1.5">
              <Badge
                :src="formatInfo.image"
                :alt="formatInfo.name"
                class="translate-y-0 scale-[125%] mr-1"
              />
              <span class="text-sm">{{ formatInfo.name }} ruleset</span>
            </div>
          </div>
        </slot>
      </div>

      <!-- Actions -->
      <div class="flex gap-1">
        <template v-if="showEdit">
          <RouterLink v-if="!completion.admin_note" :to="editUrl!">
            <Button><i class="bi bi-pencil-fill" /></Button>
          </RouterLink>
          <Button v-else disabled><i class="bi bi-pencil-fill" /></Button>
        </template>
        <Button @click="emit('toggleDetail')">
          <i class="bi bi-search" />
        </Button>
      </div>
    </div>

    <!-- Small screens: two rows -->
    <div class="md:hidden">
      <div class="flex items-center gap-2">
        <div class="flex-1 min-w-0">
          <slot />
        </div>
        <div class="flex gap-1 shrink-0">
          <template v-if="showEdit">
            <RouterLink v-if="!completion.admin_note" :to="editUrl!">
              <Button><i class="bi bi-pencil-fill" /></Button>
            </RouterLink>
            <Button v-else disabled><i class="bi bi-pencil-fill" /></Button>
          </template>
          <Button @click="emit('toggleDetail')">
            <i class="bi bi-search" />
          </Button>
        </div>
      </div>

      <div class="flex items-center gap-2 mt-2">
        <slot name="medals">
          <!-- Medals -->
          <div class="flex items-center gap-2">
            <Tooltip
              :text="completion.black_border ? 'Black Border' : 'CHIMPS'"
            >
              <img
                :src="
                  completion.black_border
                    ? '/images/medals/medal_bb.webp'
                    : '/images/medals/medal_win.webp'
                "
                class="w-[40px] h-[40px]"
              />
            </Tooltip>
            <Tooltip text="No Optimal Hero">
              <img
                src="/images/medals/medal_nogerry.webp"
                class="w-[40px] h-[40px]"
                :class="
                  hideNoGeraldo
                    ? 'opacity-0 pointer-events-none'
                    : { 'medal-blocked': !completion.no_geraldo }
                "
              />
            </Tooltip>
            <Tooltip text="Current LCC">
              <img
                src="/images/medals/medal_lcc.webp"
                class="w-[40px] h-[40px]"
                :class="
                  completion.is_current_lcc
                    ? ''
                    : 'opacity-0 pointer-events-none'
                "
              />
            </Tooltip>
          </div>

          <!-- Format ruleset -->
          <div v-if="formatInfo" class="flex-1 flex items-center gap-1.5">
            <Badge
              :src="formatInfo.image"
              :alt="formatInfo.name"
              class="translate-y-0 scale-[125%] mr-1"
            />
            <span class="text-sm">{{ formatInfo.name }} ruleset</span>
          </div>
        </slot>
      </div>
    </div>

    <!-- Admin note -->
    <CompletionAdminNote
      v-if="completion.admin_note"
      :note="completion.admin_note"
      class="mt-2"
      @delete="deleteAdminNote(completion.id)"
    />

    <!-- Expanded detail -->
    <div v-if="expanded" class="border-t border-(--color-primary) mt-2 pt-2">
      <slot name="detail" />
    </div>
  </div>
</template>

<style scoped>
.medal-blocked {
  filter: brightness(0%) drop-shadow(1px 1px 0 white)
    drop-shadow(-1px -1px 0 white);
}
</style>
