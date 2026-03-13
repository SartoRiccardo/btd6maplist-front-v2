export interface Config {
  // Maplist scoring
  points_top_map: number;
  points_bottom_map: number;
  formula_slope: number;
  points_extra_lcc: number;
  points_multi_gerry: number;
  points_multi_bb: number;
  decimal_digits: number;
  map_count: number;
  current_btd6_ver: number;

  // Expert List scoring
  exp_points_casual: number;
  exp_points_medium: number;
  exp_points_high: number;
  exp_points_true: number;
  exp_points_extreme: number;
  exp_nogerry_points_casual: number;
  exp_nogerry_points_medium: number;
  exp_nogerry_points_high: number;
  exp_nogerry_points_true: number;
  exp_nogerry_points_extreme: number;
  exp_bb_multi: number;
  exp_lcc_extra: number;
}
