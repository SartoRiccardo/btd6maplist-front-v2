import { inject, provide, type MaybeRefOrGetter } from "vue";
import type { CompletionDetail } from "@/services/api/completions/types";

export interface CompletionActions {
  disabled?: MaybeRefOrGetter<boolean>;
  shouldShowActions?: (completion: CompletionDetail) => boolean;
  onApprove?: (completion: CompletionDetail) => void;
  onReject?: (completion: CompletionDetail) => void;
  onAddNote?: (completion: CompletionDetail) => void;
}

const COMPLETION_ACTIONS_KEY = Symbol("completionActions");

export function provideCompletionActions(actions: CompletionActions) {
  provide(COMPLETION_ACTIONS_KEY, actions);
}

export function useCompletionActions(): CompletionActions {
  return inject(COMPLETION_ACTIONS_KEY, {});
}
