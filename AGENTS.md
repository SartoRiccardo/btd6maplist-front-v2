# Bloons TD 6 Maplist Frontend

## Code Style

- `<script setup lang="ts">` goes at the top of Vue SFCs, before `<template>`
- Use Tailwind classes exclusively — no `<style scoped>` blocks or custom CSS classes (global utilities in style.css are fine)
- Prefer Tailwind over inline styles
- Components should be dumb/presentational by default — data fetching belongs in views or composables, not components

## Architecture

- API services live in `src/services/api/<resource>/` with `types.ts`, `index.ts` (fetch functions), and `queries.ts` (TanStack Vue Query hooks)
- Query hooks use `MaybeRefOrGetter` for reactive params — pass computeds directly, don't unwrap with `.value`
- Format-specific logic should go in composables (e.g. `useNostalgiaPackData`), not inline in views
- CSS custom properties for theming: `--color-primary`, `--color-secondary`, `--color-highlight`, `--color-active`, `--color-contrast`, `--color-text`, `--radius-panel`, `--radius-btn`
- `.font-border` is a global utility for BTD6-style text outline (black text-shadow)

## Conventions

- Avoid magic numbers for format IDs — use constants from `src/constants/formats.ts`
- Difficulty definitions are hardcoded in `src/constants/difficulties.ts`, not fetched from API
- `exactOptionalPropertyTypes` is enabled — optional props need explicit `| undefined` (e.g. `btd6Version?: number | undefined`)
- Permissions are checked via `useAuthStore().hasPermission(perm, formatId)` — returns false if banned

## Type Check

- Run `npx vue-tsc --noEmit` to verify — must pass clean
