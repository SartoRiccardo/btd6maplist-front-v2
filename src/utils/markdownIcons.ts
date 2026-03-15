/** Map of :icon_name: to image path */
export const MARKDOWN_ICONS: Record<string, string> = {
  // Medals
  completion: '/images/medals/medal_win.webp',
  no_geraldo: '/images/medals/medal_nogerry.webp',
  no_optimal_hero: '/images/medals/medal_nogerry.webp',
  black_border: '/images/medals/medal_bb.webp',
  lcc: '/images/medals/medal_lcc.webp',

  // Formats
  maplist: '/images/list_icons/icon_curver.webp',
  maplist_all_versions: '/images/list_icons/icon_allver.webp',
  expert_list: '/images/list_icons/icon_hard.webp',
  explist: '/images/list_icons/icon_hard.webp',
  best_of_the_best: '/images/list_icons/icon_botb.png',
  botb: '/images/list_icons/icon_botb.png',
  nostalgia_pack: '/images/list_icons/icon_np_1.png',
  np: '/images/list_icons/icon_np_1.png',

  // Expert List difficulties
  explist_casual: '/images/list_icons/icon_casual.webp',
  expert_list_casual: '/images/list_icons/icon_casual.webp',
  explist_medium: '/images/list_icons/icon_medium.webp',
  expert_list_medium: '/images/list_icons/icon_medium.webp',
  explist_hard: '/images/list_icons/icon_hard.webp',
  expert_list_hard: '/images/list_icons/icon_hard.webp',
  explist_true: '/images/list_icons/icon_true.webp',
  expert_list_true: '/images/list_icons/icon_true.webp',
  explist_extreme: '/images/list_icons/icon_extreme.webp',
  expert_list_extreme: '/images/list_icons/icon_extreme.webp',

  // BotB difficulties
  botb_beginner: '/images/list_icons/icon_botb_1.png',
  best_of_the_best_beginner: '/images/list_icons/icon_botb_1.png',
  botb_intermediate: '/images/list_icons/icon_botb_2.png',
  best_of_the_best_intermediate: '/images/list_icons/icon_botb_2.png',
  botb_advanced: '/images/list_icons/icon_botb_3.png',
  best_of_the_best_advanced: '/images/list_icons/icon_botb_3.png',
  botb_expert: '/images/list_icons/icon_botb_4.png',
  best_of_the_best_expert: '/images/list_icons/icon_botb_4.png',

  // Nostalgia Pack games
  np_btd1: '/images/list_icons/icon_np_1.png',
  nostalgia_pack_btd1: '/images/list_icons/icon_np_1.png',
  np_ios: '/images/list_icons/icon_np_2.png',
  nostalgia_pack_ios: '/images/list_icons/icon_np_2.png',
  np_btd4: '/images/list_icons/icon_np_3.png',
  nostalgia_pack_btd4: '/images/list_icons/icon_np_3.png',
  np_btd5: '/images/list_icons/icon_np_4.png',
  nostalgia_pack_btd5: '/images/list_icons/icon_np_4.png',
  np_btdb1: '/images/list_icons/icon_np_5.png',
  nostalgia_pack_btdb1: '/images/list_icons/icon_np_5.png',
  np_bmc: '/images/list_icons/icon_np_6.png',
  nostalgia_pack_bmc: '/images/list_icons/icon_np_6.png',
  np_battd: '/images/list_icons/icon_np_7.png',
  nostalgia_pack_battd: '/images/list_icons/icon_np_7.png',
  np_btdb2: '/images/list_icons/icon_np_8.png',
  nostalgia_pack_btdb2: '/images/list_icons/icon_np_8.png',
};

const BADGE_CLASSES = 'inline-block h-[1.5em] w-[1.5em] rounded-full border-[0.15em] border-(--color-highlight) bg-(--color-primary) object-cover align-middle -translate-y-[0.2rem]';
const ICON_CLASSES = 'inline-block h-[1.5em] w-[1.5em] object-cover align-middle -translate-y-[0.1rem]';

export function renderIcon(name: string, withBorder: boolean): string | null {
  const src = MARKDOWN_ICONS[name];
  if (!src) return null;
  const cls = withBorder ? BADGE_CLASSES : ICON_CLASSES;
  return `<img src="${src}" alt=":${name}:" title=":${name}:" class="${cls}" />`;
}
