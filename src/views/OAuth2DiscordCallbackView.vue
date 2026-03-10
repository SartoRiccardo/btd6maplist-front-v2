<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { handleDiscordCallback } from '@/services/api/auth';
import type { DiscordCallbackRequest } from '@/services/api/auth/types';

const route = useRoute();
const hasOpener = ref(false);
const error = ref<string | null>(null);

onMounted(async () => {
  hasOpener.value = !!window.opener;

  const code = route.query['code'] as string | undefined;
  const state = route.query['state'] as string;
  const errorParam = route.query['error'] as string | undefined;

  if (!state) {
    showError('State parameter is required');
    sendError('missing_state', 'State parameter is required');
    return;
  }

  try {
    const payload: DiscordCallbackRequest = {
      state,
    };

    if (code !== undefined) {
      payload.code = code;
    }

    if (errorParam !== undefined) {
      payload.error = errorParam;
    }

    const result = await handleDiscordCallback(payload);

    sendMessage({
      type: 'success',
      token: result.token,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
    showError(errorMessage);
    sendError('oauth_failed', errorMessage);
  }
});

function sendMessage(result: any) {
  if (window.opener) {
    window.opener.postMessage(
      {
        type: 'discord-auth-result',
        result,
      },
      window.location.origin
    );
  }
  setTimeout(() => {
    window.close();
  }, 100);
}

function sendError(errorCode: string, message?: string) {
  sendMessage({
    type: 'error',
    error: errorCode,
    message,
  });
}

function showError(message: string) {
  error.value = message;
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="text-center">
      <h1 class="text-2xl font-bold mb-4">Authenticating...</h1>
      <p v-if="!error" class="text-gray-600">Please wait while we complete your sign-in.</p>
      <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>
      <p v-if="!hasOpener" class="text-yellow-600 mt-4">
        This window should close automatically. If it doesn't, you can close it manually.
      </p>
    </div>
  </div>
</template>
