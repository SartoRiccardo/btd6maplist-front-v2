import type { Config } from '@/services/api/config/types';

export function calcMapPoints(
  idx: number,
  config: Config,
): number {
  const { points_top_map, points_bottom_map, formula_slope, map_count, decimal_digits } = config;
  const result =
    points_bottom_map *
    (points_top_map / points_bottom_map) **
      ((1 + (1 - idx) / (map_count - 1)) ** formula_slope);
  return parseFloat(result.toFixed(decimal_digits));
}
