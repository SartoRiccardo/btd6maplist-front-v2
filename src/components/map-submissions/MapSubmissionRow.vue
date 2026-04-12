<script setup lang="ts">
import { computed, ref } from "vue";
import { useQuery } from "@tanstack/vue-query";
import type { MapSubmission } from "@/services/api/map-submissions/types";
import { getCustomMap } from "@/services/ninjakiwi";
import { getRetroMap } from "@/services/api/retro-maps";
import { retroMapQueryKeys } from "@/services/api/retro-maps/queries";
import { FORMAT_ICONS, FORMAT_NOSTALGIA_PACK } from "@/constants/formats";
import { fromNow } from "@/utils/dates";
import Badge from "@/components/common/Badge.vue";
import Button from "@/components/ui/Button.vue";
import ImageLightbox from "@/components/common/ImageLightbox.vue";
import UserEntry from "@/components/users/UserEntry.vue";

const lightbox = ref<InstanceType<typeof ImageLightbox>>();

const props = withDefaults(
  defineProps<{
    submission: MapSubmission;
    hideSubmitter?: boolean;
  }>(),
  {
    hideSubmitter: false,
  },
);

const { data: nkMap } = useQuery({
  queryKey: computed(() => ["nk", "map", props.submission.code]),
  queryFn: () => getCustomMap(props.submission.code),
  staleTime: 24 * 60 * 60 * 1000,
});

const mapName = computed(() => nkMap.value?.name ?? props.submission.code);

const previewUrl = computed(
  () =>
    `https://data.ninjakiwi.com/btd6/maps/map/${props.submission.code}/preview`,
);

const formatInfo = computed(() =>
  FORMAT_ICONS.find((f) => f.id === props.submission.format_id),
);

const isNP = computed(
  () => props.submission.format_id === FORMAT_NOSTALGIA_PACK,
);

const { data: retroMap } = useQuery({
  queryKey: computed(() => retroMapQueryKeys.detail(props.submission.proposed)),
  queryFn: () => getRetroMap(props.submission.proposed),
  enabled: isNP,
  staleTime: 24 * 60 * 60 * 1000,
});

const proposedLabel = computed(() => {
  if (isNP.value) {
    return retroMap.value?.name ?? null;
  }
  const diffs = props.submission.format?.proposed_difficulties;
  if (!diffs) return null;
  return diffs[props.submission.proposed] ?? null;
});

const statusPill = computed(() => {
  if (props.submission.status === "rejected")
    return { label: "Rejected", class: "bg-(--color-deleted)" };
  if (props.submission.status === "pending")
    return { label: "Pending", class: "bg-(--color-pending)" };
  if (props.submission.status === "accepted")
    return { label: "Accepted", class: "bg-(--color-success)" };
  return null;
});

const createdOn = computed(() => {
  const ts = Number(props.submission.created_on);
  if (!Number.isNaN(ts)) return fromNow(ts);
  const parsed = Date.parse(props.submission.created_on);
  if (!Number.isNaN(parsed)) return fromNow(Math.floor(parsed / 1000));
  return props.submission.created_on;
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

    <div class="flex items-start gap-3">
      <div class="flex items-center gap-3 flex-1 min-w-0">
        <img
          class="w-16 h-auto aspect-[3/2] bg-(--color-primary) rounded-sm shrink-0 cursor-pointer"
          :src="previewUrl"
          alt=""
          loading="lazy"
          @click="lightbox?.show(previewUrl)"
        />
        <div>
          <span class="font-['Luckiest_Guy'] font-border text-base">
            {{ mapName }}
          </span>
          <p class="text-sm text-(--color-text-muted) mb-0">
            {{ submission.code }} | {{ createdOn }}
          </p>
        </div>
      </div>

      <div
        v-if="formatInfo"
        class="hidden md:flex items-center gap-1.5 shrink-0 self-center mr-2"
      >
        <Badge
          :src="formatInfo.image"
          :alt="formatInfo.name"
          class="translate-y-0 scale-[125%] mr-1"
        />
        <span class="text-sm">{{ formatInfo.name }}</span>
      </div>

      <div class="hidden md:flex gap-1 shrink-0 self-center">
        <Button @click="lightbox?.show(submission.completion_proof)">
          <i class="bi bi-search" />
        </Button>
        <slot name="buttons" />
      </div>
    </div>

    <div class="flex md:hidden items-center my-3">
      <template v-if="formatInfo">
        <Badge
          :src="formatInfo.image"
          :alt="formatInfo.name"
          class="translate-y-0 scale-[125%] mr-1"
        />
        <span class="text-sm">{{ formatInfo.name }}</span>
      </template>
      <div class="flex gap-1 ml-auto">
        <Button @click="lightbox?.show(submission.completion_proof)">
          <i class="bi bi-search" />
        </Button>
        <slot name="buttons" />
      </div>
    </div>

    <ul class="list-['-_'] list-inside text-sm mt-1 mb-0 space-y-0.5">
      <li v-if="proposedLabel">
        {{ isNP ? "Remake of:" : "Submitted as:" }}
        <span class="font-bold">{{ proposedLabel }}</span>
      </li>

      <li v-if="!hideSubmitter">
        Submitted by:
        <UserEntry :user="submission.submitter" inline class="inline" />
      </li>
    </ul>

    <p v-if="submission.subm_notes" class="text-sm mt-2 mb-0 italic">
      &laquo;{{ submission.subm_notes }}&raquo;
    </p>

    <ImageLightbox ref="lightbox" />
  </div>
</template>
