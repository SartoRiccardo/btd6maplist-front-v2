export interface RetroGame {
  id: number;
  game_id: number;
  category_id: number;
  subcategory_id: number;
  game_name: string;
  category_name: string;
  subcategory_name: string;
  total_maps?: number;
  maps_remade?: number;
}

export interface GetRetroGamesParams {
  page?: number;
  per_page?: number;
  include?: string;
}
