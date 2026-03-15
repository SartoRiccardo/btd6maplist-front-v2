import type { PlatformRole } from '@/services/api/platform-roles/types';
import type { AchievementRole } from '@/services/api/achievement-roles/types';

export interface UserMedals {
  wins: number;
  black_border: number;
  no_geraldo: number;
  current_lcc: number;
}

/** Permission map: key is permission name, value is array of format IDs (null = global) */
export type Permissions = Record<string, (number | null)[]>;

export interface User {
  discord_id: string;
  name: string;
  is_banned: boolean;
  roles: PlatformRole[];
  // Only included when 'flair' is in include parameter
  avatar_url?: string | null;
  banner_url?: string | null;
  // Only included when 'medals' is in include parameter
  medals?: UserMedals;
  // Only included when 'achievement_roles' is in include parameter
  achievement_roles?: AchievementRole[];
  // Only included when 'permissions' is in include parameter
  permissions?: Permissions;
}

export interface UpdateUserRequest {
  name: string; // required, max 50 characters, must be unique (case-insensitive)
  nk_oak?: string | null; // optional - Ninja Kiwi OpenAPI Key
}

export type UserIncludeParams = Array<'flair' | 'medals' | 'achievement_roles' | 'permissions'>;

export interface GetUserParams {
  include?: UserIncludeParams;
  timestamp?: number; // Unix timestamp for medal calculation (defaults to now)
}
