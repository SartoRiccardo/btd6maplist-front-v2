import type { User } from "@/services/api/users/types";
import type { MapWithMetadata } from "@/services/api/maps/types";

export interface UserSearchResult {
  type: "user";
  result: User;
}

export interface MapSearchResult {
  type: "map";
  result: MapWithMetadata & { is_verified: boolean };
}

export type SearchResult = UserSearchResult | MapSearchResult;

export type SearchEntity = "users" | "maps";

export interface SearchParams {
  q: string;
  entities?: SearchEntity[];
  limit?: number;
}
