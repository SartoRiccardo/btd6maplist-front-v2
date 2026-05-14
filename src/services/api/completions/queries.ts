import { computed, toValue, type MaybeRefOrGetter } from "vue";
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/vue-query";
import {
  deleteAdminNote,
  deleteCompletion,
  getCompletion,
  getCompletions,
  saveCompletion,
  setAdminNote,
  submitCompletion,
  updateCompletion,
} from "./index";
import type {
  Completion,
  CompletionDetail,
  GetCompletionParams,
  GetCompletionsParams,
  SaveCompletionRequest,
  SubmitCompletionRequest,
  UpdateCompletionRequest,
} from "./types";
import type { PaginatedResponse } from "@/services/api/common/types";

export const completionQueryKeys = {
  all: ["completions"] as const,
  list: (params?: GetCompletionsParams) => ["completions", params] as const,
  detail: (id: number, params?: GetCompletionParams) =>
    ["completions", id, params] as const,
} as const;

/**
 * Query hook to fetch completions with optional filters.
 * Params can be reactive (ref, computed, or getter).
 */
export function useCompletions(
  params?: MaybeRefOrGetter<GetCompletionsParams | undefined>,
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Completion>>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: computed(() => completionQueryKeys.list(toValue(params))),
    queryFn: () => getCompletions(toValue(params)),
    ...options,
  });
}

/**
 * Query hook to fetch a single completion by ID.
 */
export function useCompletion(
  id: MaybeRefOrGetter<number>,
  params?: MaybeRefOrGetter<GetCompletionParams | undefined>,
  options?: Omit<UseQueryOptions<CompletionDetail>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: computed(() =>
      completionQueryKeys.detail(toValue(id), toValue(params)),
    ),
    queryFn: () => getCompletion(toValue(id), toValue(params)),
    ...options,
  });
}

/**
 * Mutation hook to submit a completion for review.
 */
export function useSubmitCompletion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubmitCompletionRequest) => submitCompletion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: completionQueryKeys.all });
    },
  });
}

/**
 * Mutation hook to admin-create (auto-accept) a completion.
 */
export function useSaveCompletion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SaveCompletionRequest) => saveCompletion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: completionQueryKeys.all });
    },
  });
}

/**
 * Mutation hook to update a completion.
 */
export function useUpdateCompletion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCompletionRequest }) =>
      updateCompletion(id, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({
        queryKey: completionQueryKeys.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: completionQueryKeys.all });
    },
  });
}

/**
 * Mutation hook to set the admin note on a completion.
 */
export function useSetAdminNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, note }: { id: number; note: string }) =>
      setAdminNote(id, note),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: completionQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: completionQueryKeys.all });
    },
  });
}

/**
 * Mutation hook to delete the admin note on a completion.
 */
export function useDeleteAdminNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteAdminNote(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: completionQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: completionQueryKeys.all });
    },
  });
}

/**
 * Mutation hook to delete (reject) a completion.
 */
export function useDeleteCompletion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteCompletion(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({
        queryKey: completionQueryKeys.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: completionQueryKeys.all });
    },
  });
}
