export interface DiscordRole {
  guild_id: string;
  role_id: string;
}

export interface AchievementRole {
  id: number;
  lb_format: number;
  lb_type: string;
  threshold: number;
  for_first: boolean;
  tooltip_description: string | null;
  name: string;
  clr_border: number;
  clr_inner: number;
  discord_roles: DiscordRole[];
}

export interface UpsertAchievementRoleRequest {
  lb_format: number;
  lb_type: string;
  threshold: number;
  for_first: boolean;
  name: string;
  clr_border: number;
  clr_inner: number;
  tooltip_description?: string | null;
  discord_roles?: DiscordRole[] | null;
}
