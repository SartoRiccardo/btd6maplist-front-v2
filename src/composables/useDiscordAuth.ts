import { ref } from 'vue';
import { getDiscordLoginUrl } from '@/services/api/auth';

export interface DiscordAuthSuccess {
  type: 'success';
  token: string;
}

export interface DiscordAuthError {
  type: 'error';
  error: string;
  description?: string;
  message?: string;
}

export interface DiscordAuthCanceled {
  type: 'canceled';
}

export type DiscordAuthResult = DiscordAuthSuccess | DiscordAuthError | DiscordAuthCanceled;

const POPUP_WIDTH = 500;
const POPUP_HEIGHT = 700;
const POPUP_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Composable for Discord OAuth2 authentication using popup flow
 */
export function useDiscordAuth() {
  const isLoading = ref(false);

  /**
   * Launch Discord OAuth2 login popup
   * @returns Promise resolving to auth result
   */
  async function launchLoginWindow(): Promise<DiscordAuthResult> {
    isLoading.value = true;

    try {
      // Get the Discord authorization URL
      const { url } = await getDiscordLoginUrl();

      return new Promise<DiscordAuthResult>((resolve) => {
        // Calculate popup position (centered on screen)
        const left = window.screenX + (window.innerWidth - POPUP_WIDTH) / 2;
        const top = window.screenY + (window.innerHeight - POPUP_HEIGHT) / 2;

        // Open popup window
        const popup = window.open(
          url,
          'discord-oauth2',
          `width=${POPUP_WIDTH},height=${POPUP_HEIGHT},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );

        if (!popup) {
          isLoading.value = false;
          resolve({
            type: 'error',
            error: 'popup_blocked',
            message: 'Popup was blocked. Please allow popups for this site.',
          });
          return;
        }

        // Set up timeout
        const timeoutId = setTimeout(() => {
          cleanup();
          if (!popup.closed) {
            popup.close();
          }
          isLoading.value = false;
          resolve({
            type: 'error',
            error: 'timeout',
            message: 'Authentication timed out. Please try again.',
          });
        }, POPUP_TIMEOUT_MS);

        // Listen for messages from popup
        const messageHandler = (event: MessageEvent) => {
          // Security: Only accept messages from same origin
          if (event.origin !== window.location.origin) {
            return;
          }

          // Check if this is our auth message
          if (event.data?.type === 'discord-auth-result') {
            cleanup();
            isLoading.value = false;
            resolve(event.data.result);
          }
        };

        // Check if popup was closed by user
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            cleanup();
            isLoading.value = false;
            resolve({ type: 'canceled' });
          }
        }, 500);

        // Cleanup function
        function cleanup() {
          clearTimeout(timeoutId);
          clearInterval(checkClosed);
          window.removeEventListener('message', messageHandler);
          if (!popup.closed) {
            popup.close();
          }
        }

        // Set up message listener
        window.addEventListener('message', messageHandler);
      });
    } catch (error) {
      isLoading.value = false;
      return {
        type: 'error',
        error: 'unknown',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  return {
    isLoading,
    launchLoginWindow,
  };
}
