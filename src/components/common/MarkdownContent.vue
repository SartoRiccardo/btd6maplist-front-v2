<script setup lang="ts">
import { computed } from 'vue';
import { Marked } from 'marked';
import { renderIcon } from '@/utils/markdownIcons';

const props = defineProps<{
  text: string;
}>();

const iconExtension = {
  name: 'icon',
  level: 'inline' as const,
  start(src: string) { return src.match(/:/)?.index; },
  tokenizer(src: string) {
    // :(name): — with border (badge style)
    const borderMatch = /^:\(([a-z0-9_]+)\):/.exec(src);
    if (borderMatch) {
      return {
        type: 'icon',
        raw: borderMatch[0],
        name: borderMatch[1],
        withBorder: true,
      };
    }
    // :name: — no border
    const match = /^:([a-z0-9_]+):/.exec(src);
    if (match) {
      return {
        type: 'icon',
        raw: match[0],
        name: match[1],
        withBorder: false,
      };
    }
    return undefined;
  },
  renderer(token: { name: string; withBorder: boolean; raw: string }) {
    return renderIcon(token.name, token.withBorder) ?? token.raw;
  },
};

const marked = new Marked({ extensions: [iconExtension] });

const html = computed(() => marked.parse(props.text) as string);
</script>

<template>
  <div class="markdown-content" v-html="html" />
</template>

<style scoped>
.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3) {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.markdown-content :deep(p) {
  margin-bottom: 0.75rem;
}

.markdown-content :deep(ul) {
  list-style: disc;
  padding-left: 1.5rem;
  margin-bottom: 0.75rem;
}

.markdown-content :deep(ol) {
  list-style: decimal;
  padding-left: 1.5rem;
  margin-bottom: 0.75rem;
}

.markdown-content :deep(li) {
  margin-bottom: 0.25rem;
}

.markdown-content :deep(a) {
  color: var(--color-highlight);
}

.markdown-content :deep(code) {
  background: var(--color-primary);
  padding: 0.1rem 0.3rem;
  border-radius: 0.2rem;
}

.markdown-content :deep(blockquote) {
  border-left: 3px solid var(--color-highlight);
  padding-left: 1rem;
  margin-left: 0;
  opacity: 0.8;
}
</style>
