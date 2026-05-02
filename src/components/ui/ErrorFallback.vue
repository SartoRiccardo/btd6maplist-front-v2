<script setup lang="ts">
import { ref } from "vue";
import Button from "@/components/ui/Button.vue";

const props = defineProps<{ error: unknown }>();
const emit = defineEmits<{ reset: [] }>();

const copied = ref(false);
let copyTimeout: ReturnType<typeof setTimeout> | null = null;

function errorText(): string {
  const lines: string[] = [];
  lines.push(`Route: ${window.location.pathname}`);
  lines.push(`UA: ${navigator.userAgent}`);
  lines.push(`Time: ${new Date().toISOString()}`);
  if (props.error instanceof Error) {
    lines.push(`\nError: ${props.error.message}`);
    if (props.error.stack) lines.push(props.error.stack);
  } else {
    lines.push(`\nError: ${String(props.error)}`);
  }
  return lines.join("\n");
}

async function copyDetails() {
  await navigator.clipboard.writeText(errorText());
  copied.value = true;
  if (copyTimeout) clearTimeout(copyTimeout);
  copyTimeout = setTimeout(() => {
    copied.value = false;
  }, 5000);
}

function message(): string {
  if (props.error instanceof Error) return props.error.message;
  return String(props.error);
}
</script>

<template>
  <div
    class="flex flex-col items-center justify-center min-h-64 gap-6 py-16 px-4"
  >
    <div
      class="w-full max-w-lg bg-(--color-secondary) rounded-(--radius-panel) p-6 flex flex-col gap-4"
    >
      <h2 class="text-xl font-bold font-border text-(--color-danger)">
        Something went wrong
      </h2>
      <p class="text-sm text-(--color-text) opacity-75">
        This page encountered a rendering error. Copy the error details below
        and report it by messaging
        <span class="font-semibold underline">@chimenea.mo</span> on Discord or
        opening an issue on
        <a
          href="https://github.com/SartoRiccardo/btd6maplist-front-v2/issues/new"
          target="_blank"
          rel="noopener noreferrer"
          class="text-(--color-highlight) underline hover:opacity-80"
          >GitHub</a
        >.
      </p>
      <pre
        class="text-xs bg-(--color-primary) rounded p-3 overflow-x-auto whitespace-pre-wrap break-all opacity-80"
        >{{ message() }}</pre
      >
      <div class="flex gap-3 flex-wrap">
        <Button :active="true" @click="copyDetails">
          <i class="mr-1" :class="copied ? 'bi bi-check-lg' : 'bi bi-copy'" />
          {{ copied ? "Copied!" : "Copy error details" }}
        </Button>
        <Button @click="emit('reset')">Try navigating away</Button>
      </div>
    </div>
  </div>
</template>
