<script setup lang="ts">
import { useDiscordAuth } from '@/composables/useDiscordAuth';
import { useAuthStore } from '@/stores/auth';

const props = withDefaults(defineProps<{
  text?: string;
}>(), {
  text: 'Login',
});

const emit = defineEmits<{
  success: [];
}>();

const authStore = useAuthStore();
const { launchLoginWindow, isLoading: loginLoading } = useDiscordAuth();

async function handleDiscordLogin() {
  const result = await launchLoginWindow();

  if (result.type === 'success') {
    authStore.setToken(result.token);
    emit('success');
  } else if (result.type === 'canceled') {
    console.log('Login canceled by user');
  } else {
    console.error('Login failed:', result.error, result.message);
  }
}
</script>

<template>
  <button
    @click="handleDiscordLogin"
    :disabled="loginLoading"
    class="flex items-center justify-center gap-2 bg-[#5865F2] text-[#E0E3FF] rounded-xl px-4 py-2 hover:cursor-pointer hover:bg-[#4752C4] transition-colors duration-200 ease disabled:opacity-50 disabled:cursor-not-allowed"
    aria-label="Login with Discord"
  >
    <i class="bi bi-discord text-xl scale-150 mr-1 ml-1 translate-y-[-0.1rem]"></i>
    <span class="text-[1.6rem] font-['Oswald'] font-bold uppercase">
      {{ loginLoading ? 'Loading...' : props.text }}
    </span>
  </button>
</template>
