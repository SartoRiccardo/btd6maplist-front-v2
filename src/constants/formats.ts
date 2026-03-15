export const FORMAT_MAPLIST = 1;
export const FORMAT_MAPLIST_ALL_VER = 2;
export const FORMAT_NOSTALGIA_PACK = 11;
export const FORMAT_EXPERT_LIST = 51;
export const FORMAT_BEST_OF_THE_BEST = 52;

export const FORMAT_DESCRIPTIONS: Partial<Record<number, string>> = {
  [FORMAT_MAPLIST]: "The 50 hardest custom maps in the game, ordered by difficulty. Good luck, you'll need it...",
};

// TODO: image should come from the API (format object) instead of being hardcoded here
export interface FormatIcon {
  id: number;
  image: string;
  name: string;
  slug: string | null;
}

export const FORMAT_ICONS: FormatIcon[] = [
  { id: FORMAT_MAPLIST, image: '/images/list_icons/icon_curver.webp', name: 'Maplist', slug: 'maplist' },
  { id: FORMAT_MAPLIST_ALL_VER, image: '/images/list_icons/icon_allver.webp', name: 'All Versions', slug: null },
  { id: FORMAT_EXPERT_LIST, image: '/images/list_icons/icon_hard.webp', name: 'Expert List', slug: 'expert-list' },
  { id: FORMAT_BEST_OF_THE_BEST, image: '/images/list_icons/icon_botb.png', name: 'Best of the Best', slug: 'best-of-the-best' },
  { id: FORMAT_NOSTALGIA_PACK, image: '/images/list_icons/icon_np_1.png', name: 'Nostalgia Pack', slug: 'nostalgia-pack' },
];

export const FORMATS_WITH_POINTS = [FORMAT_MAPLIST, FORMAT_MAPLIST_ALL_VER, FORMAT_EXPERT_LIST];

export interface LeaderboardValueOption {
  icon?: string;
  key: string;
  label: string;
  suffix?: string;
}

export const LEADERBOARD_VALUES: LeaderboardValueOption[] = [
  { key: 'points', label: 'Points', suffix: 'pts' },
  { icon: '/images/medals/medal_lcc.webp', key: 'lccs', label: 'LCCs' },
  { icon: '/images/medals/medal_nogerry.webp', key: 'no_geraldo', label: 'No Optimal Hero' },
  { icon: '/images/medals/medal_bb.webp', key: 'black_border', label: 'Black Border' },
];
