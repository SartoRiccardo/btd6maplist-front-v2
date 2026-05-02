<script setup lang="ts">
const props = defineProps<{ error: unknown }>();
const emit = defineEmits<{ reset: [] }>();

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
}

function message(): string {
  if (props.error instanceof Error) return props.error.message;
  return String(props.error);
}
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-64 gap-6 py-16 px-4">
    <div class="w-full max-w-lg bg-(--color-secondary) rounded-(--radius-panel) p-6 flex flex-col gap-4">
      <h2 class="text-xl font-bold font-border text-(--color-danger)">Something went wrong</h2>
      <p class="text-sm text-(--color-text) opacity-75">
        This page encountered a rendering error. Use the buttons below to copy the error details
        and include them in a bug report.
      </p>
      <pre class="text-xs bg-(--color-primary) rounded p-3 overflow-x-auto whitespace-pre-wrap break-all opacity-80">{{ message() }}</pre>
      <div class="flex gap-3 flex-wrap">
        <button
          class="bg-(--color-highlight) text-(--color-contrast) rounded-(--radius-btn) px-4 py-2 text-sm font-semibold hover:opacity-80 transition-opacity"
          @click="copyDetails"
        >
          Copy error details
        </button>
        <button
          class="bg-(--color-secondary) border border-(--color-highlight) text-(--color-text) rounded-(--radius-btn) px-4 py-2 text-sm font-semibold hover:opacity-80 transition-opacity"
          @click="emit('reset')"
        >
          Try navigating away
        </button>
      </div>
    </div>
  </div>
</template>
