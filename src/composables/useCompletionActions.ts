import { inject, provide } from "vue";

export interface CompletionActions {
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
}

const COMPLETION_ACTIONS_KEY = Symbol("completionActions");

export function provideCompletionActions(actions: CompletionActions) {
  provide(COMPLETION_ACTIONS_KEY, actions);
}

export function useCompletionActions(): CompletionActions {
  return inject(COMPLETION_ACTIONS_KEY, {});
}
