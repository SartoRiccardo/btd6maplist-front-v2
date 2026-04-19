import { computed, toValue, type MaybeRefOrGetter } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { getUserGuilds, getGuildRoles } from "./index";

export const discordQueryKeys = {
  guilds: ["discord", "guilds"] as const,
  roles: (guildId: string) => ["discord", "roles", guildId] as const,
};

export function useDiscordGuilds() {
  return useQuery({
    queryKey: discordQueryKeys.guilds,
    queryFn: getUserGuilds,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useGuildRoles(guildId: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: computed(() => discordQueryKeys.roles(toValue(guildId))),
    queryFn: () => getGuildRoles(toValue(guildId)),
    enabled: () => !!toValue(guildId),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
