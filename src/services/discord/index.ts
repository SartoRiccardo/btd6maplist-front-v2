import { getAuthToken } from "@/services/api/client";
import { api } from "@/services/api/client";

const BASE_URL = "https://discord.com/api/v10";

async function discordRequest<T>(endpoint: string): Promise<T> {
  const token = getAuthToken();
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error(`Discord API error ${response.status}`);
  return response.json() as Promise<T>;
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  permissions: string; // bitfield string
}

const PERMISSION_ADMINISTRATOR = BigInt(0x8);
const PERMISSION_MANAGE_ROLES = BigInt(0x10000000);

export function canManageRoles(guild: DiscordGuild): boolean {
  const perms = BigInt(guild.permissions);
  return (
    (perms & PERMISSION_ADMINISTRATOR) !== BigInt(0) ||
    (perms & PERMISSION_MANAGE_ROLES) !== BigInt(0)
  );
}

export interface DiscordRole {
  id: string;
  name: string;
  color: number;
}

export function getUserGuilds(): Promise<DiscordGuild[]> {
  return discordRequest<DiscordGuild[]>("/users/@me/guilds");
}

export function getGuildRoles(guildId: string): Promise<DiscordRole[]> {
  return api.get<DiscordRole[]>(`/api/proxy/discord/guilds/${guildId}/roles`);
}
