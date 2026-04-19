<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { refDebounced } from "@vueuse/core";
import { useUsers } from "@/services/api/users/queries";
import UserEntry from "@/components/users/UserEntry.vue";
import NewUserModal from "@/components/users/NewUserModal.vue";
import Pagination from "@/components/ui/Pagination.vue";
import Button from "@/components/ui/Button.vue";

const newUserModal = ref<InstanceType<typeof NewUserModal> | null>(null);

const page = ref(1);
const search = ref("");
const debouncedSearch = refDebounced(search, 300);

watch(debouncedSearch, () => {
  page.value = 1;
});

const { data: users, isLoading } = useUsers(
  computed(() => ({
    page: page.value,
    per_page: 20,
    search: debouncedSearch.value || undefined,
    include: "flair" as const,
  })),
);

const cachedMeta = ref<{ lastPage: number } | null>(null);
watch(
  () => users.value,
  (data) => {
    if (data) {
      cachedMeta.value = { lastPage: Math.ceil(data.total / data.per_page) };
    }
  },
);
</script>

<template>
  <div>
    <h1
      class="font-['Luckiest_Guy'] text-3xl md:text-4xl text-center mt-6 mb-4"
    >
      Users
    </h1>

    <div class="flex gap-2 mb-4">
      <input
        v-model="search"
        type="text"
        placeholder="Search users..."
        class="flex-1 px-3 py-1.5 rounded-(--radius-btn) bg-(--color-primary) text-(--color-text) border border-(--color-contrast) focus:outline-none focus:border-(--color-active)"
      />
      <Button @click="newUserModal?.open()">+ New User</Button>
    </div>

    <div v-if="isLoading" class="flex justify-center">
      <p class="text-(--color-text-muted)">Loading...</p>
    </div>

    <template v-else-if="users && users.data.length > 0">
      <div
        v-for="user in users.data"
        :key="user.discord_id"
        class="bg-(--color-secondary) rounded-(--radius-panel) my-2 py-2 px-3"
        :class="{ 'line-through': user.is_banned }"
      >
        <UserEntry :user="user" :centered="true" :text-size="'lg'" />
      </div>
    </template>

    <p v-else-if="!isLoading" class="text-center text-(--color-text-muted)">
      No users found.
    </p>

    <Pagination
      v-if="cachedMeta"
      :current-page="page"
      :last-page="cachedMeta.lastPage"
      :disabled="isLoading"
      @update:current-page="page = $event"
    />

    <NewUserModal ref="newUserModal" />
  </div>
</template>
