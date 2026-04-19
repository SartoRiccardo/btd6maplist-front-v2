<script setup lang="ts">
import { computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useFormats } from "@/services/api/formats/queries";
import { permissions } from "@/constants/permissions";
import { FORMAT_ICONS } from "@/constants/formats";
import Badge from "@/components/common/Badge.vue";
import LinkButton from "@/components/ui/LinkButton.vue";

const auth = useAuthStore();

const { data: formatsData, isLoading } = useFormats();

const visibleFormats = computed(() => {
  if (!formatsData.value) return [];
  return formatsData.value.data.filter(
    (fmt) =>
      auth.hasPermission(permissions.achievementRoles.edit, fmt.id) ||
      auth.hasPermission(permissions.formatPresentation.edit, fmt.id),
  );
});

function iconFor(formatId: number) {
  return FORMAT_ICONS.find((f) => f.id === formatId);
}
</script>

<template>
  <div>
    <h1 class="font-['Luckiest_Guy'] text-3xl md:text-4xl text-center mt-6 mb-6">
      Lists
    </h1>

    <div v-if="isLoading" class="flex justify-center py-12">
      <p class="text-(--color-text-muted)">Loading...</p>
    </div>

    <div v-else-if="visibleFormats.length === 0" class="flex justify-center py-12">
      <p class="text-(--color-text-muted)">You don't have permission to manage any lists.</p>
    </div>

    <div v-else>
      <div
        v-for="fmt in visibleFormats"
        :key="fmt.id"
        class="bg-(--color-secondary) rounded-(--radius-panel) my-2 py-2 px-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div class="flex items-center gap-3">
          <Badge
            v-if="iconFor(fmt.id)"
            :src="iconFor(fmt.id)!.image"
            :alt="fmt.name"
          />
          <span class="font-['Luckiest_Guy'] text-(--color-text) font-border text-base">{{ fmt.name }}</span>
        </div>

        <div class="flex justify-end gap-2">
          <LinkButton
            v-if="auth.hasPermission(permissions.achievementRoles.edit, fmt.id)"
            :to="`/admin/lists/${fmt.id}/achievement-roles`"
          >
            Achievement Roles
          </LinkButton>
          <LinkButton
            v-if="auth.hasPermission(permissions.formatPresentation.edit, fmt.id)"
            :to="`/admin/lists/${fmt.id}`"
          >
            List Info
          </LinkButton>
        </div>
      </div>
    </div>
  </div>
</template>
