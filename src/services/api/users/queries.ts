import { computed, toValue, type MaybeRefOrGetter } from "vue";
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/vue-query";
import {
  getUser,
  getUsers,
  createUser,
  updateUser,
  updateCurrentUser,
  getMe,
  banUser,
  unbanUser,
  addUserRole,
  removeUserRole,
} from "./index";
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  GetUserParams,
  GetUsersParams,
  UserListResponse,
} from "./types";

// Query Keys
export const userQueryKeys = {
  all: ["users"] as const,
  list: (params?: GetUsersParams) => ["users", "list", params] as const,
  detail: (id: string, params?: GetUserParams) =>
    params ? (["users", id, params] as const) : (["users", id] as const),
  me: (params?: GetUserParams): readonly ["users", "@me", GetUserParams | undefined] =>
    ["users", "@me", params],
} as const;

/**
 * Mutation hook to create a new user
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.list() });
    },
  });
}

/**
 * Query hook to fetch a paginated list of users
 */
export function useUsers(
  params?: MaybeRefOrGetter<GetUsersParams | undefined>,
  options?: Omit<UseQueryOptions<UserListResponse>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: computed(() => userQueryKeys.list(toValue(params))),
    queryFn: () => getUsers(toValue(params)),
    ...options,
  });
}

/**
 * Query hook to fetch a user by ID
 *
 * @param id - User's Discord ID or '@me' for authenticated user
 * @param params - Optional query parameters (include, timestamp)
 * @param options - Additional TanStack Query options
 */
export function useUser(
  id: MaybeRefOrGetter<string>,
  params?: MaybeRefOrGetter<GetUserParams | undefined>,
  options?: Omit<UseQueryOptions<User>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: computed(() =>
      userQueryKeys.detail(toValue(id), toValue(params)),
    ),
    queryFn: () => getUser(toValue(id), toValue(params)),
    ...options,
  });
}

/**
 * Query hook to fetch authenticated user (uses @me alias)
 *
 * @param params - Optional query parameters (include, timestamp)
 * @param options - Additional TanStack Query options
 */
export function useMe(
  params?: GetUserParams,
  options?: Omit<UseQueryOptions<User>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: userQueryKeys.me(params),
    queryFn: () => getMe(params),
    ...options,
  });
}

/**
 * Mutation hook to update a user
 *
 * @param id - User's Discord ID or '@me' for authenticated user
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      updateUser(id, data),
    onSuccess: (_, variables) => {
      // Invalidate the specific user query to trigger refetch
      queryClient.invalidateQueries({
        queryKey:
          variables.id === "@me"
            ? userQueryKeys.me()
            : userQueryKeys.detail(variables.id),
      });
    },
  });
}

/**
 * Mutation hook to update the authenticated user (uses @me alias)
 */
export function useUpdateCurrentUser(
  userId?: MaybeRefOrGetter<string | undefined>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserRequest) => updateCurrentUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.me() });
      const id = userId ? toValue(userId) : undefined;
      if (id) {
        queryClient.invalidateQueries({ queryKey: userQueryKeys.detail(id) });
      }
    },
  });
}

/**
 * Mutation hook to add or remove a platform role from a user
 */
export function useSetUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      roleId,
      grant,
    }: {
      userId: string;
      roleId: number;
      grant: boolean;
    }) => (grant ? addUserRole(userId, roleId) : removeUserRole(userId, roleId)),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: userQueryKeys.detail(variables.userId),
      });
    },
  });
}

/**
 * Mutation hook to ban or unban a user
 */
export function useBanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ban }: { id: string; ban: boolean }) =>
      ban ? banUser(id) : unbanUser(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: userQueryKeys.detail(variables.id),
      });
    },
  });
}
