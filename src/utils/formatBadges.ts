import type { MapWithMetadata } from '@/services/api/maps/types';
import type { Config } from '@/services/api/config/types';
import {
  FORMAT_MAPLIST,
  FORMAT_MAPLIST_ALL_VER,
  FORMAT_EXPERT_LIST,
  FORMAT_BEST_OF_THE_BEST,
  FORMAT_NOSTALGIA_PACK,
  FORMAT_ICONS,
} from '@/constants/formats';
import { EXPERT_DIFFICULTIES, BOTB_DIFFICULTIES } from '@/constants/difficulties';
import { calcMapPoints } from '@/utils/points';

export interface FormatBadge {
  icon: string;
  label: string;
  slug?: string | null | undefined;
  squareImage?: boolean | undefined;
}

export function getMapFormatBadges(
  map: MapWithMetadata,
  options?: {
    config?: Config | undefined;
    visibleFormatIds?: number[];
  },
): FormatBadge[] {
  const visible = options?.visibleFormatIds;
  const config = options?.config;
  const badges: FormatBadge[] = [];

  if (
    map.placement_curver != null
    && (!config || map.placement_curver <= config.map_count)
    && (!visible || visible.includes(FORMAT_MAPLIST))
  ) {
    const fmt = FORMAT_ICONS.find((f) => f.id === FORMAT_MAPLIST)!;
    const label = config
      ? `#${map.placement_curver} — ${calcMapPoints(map.placement_curver, config)}pt`
      : fmt.name;
    badges.push({ icon: fmt.image, label, slug: fmt.slug });
  }

  if (
    map.placement_allver != null
    && (!config || map.placement_allver <= config.map_count)
    && (!visible || visible.includes(FORMAT_MAPLIST_ALL_VER))
  ) {
    const fmt = FORMAT_ICONS.find((f) => f.id === FORMAT_MAPLIST_ALL_VER)!;
    const label = config
      ? `#${map.placement_allver} — ${calcMapPoints(map.placement_allver, config)}pt`
      : fmt.name;
    badges.push({ icon: fmt.image, label, slug: fmt.slug });
  }

  if (map.difficulty != null && (!visible || visible.includes(FORMAT_EXPERT_LIST))) {
    const diff = EXPERT_DIFFICULTIES.find((d) => d.value === map.difficulty);
    const fmt = FORMAT_ICONS.find((f) => f.id === FORMAT_EXPERT_LIST)!;
    if (diff) badges.push({ icon: diff.image, label: `${diff.name} Expert`, slug: fmt.slug });
  }

  if (map.botb_difficulty != null && (!visible || visible.includes(FORMAT_BEST_OF_THE_BEST))) {
    const diff = BOTB_DIFFICULTIES.find((d) => {
      const v = d.value;
      return Array.isArray(v) ? v.includes(map.botb_difficulty!) : v === map.botb_difficulty;
    });
    const fmt = FORMAT_ICONS.find((f) => f.id === FORMAT_BEST_OF_THE_BEST)!;
    if (diff) badges.push({ icon: diff.image, label: 'Best of the Best', slug: fmt.slug });
  }

  if (map.retro_map && (!visible || visible.includes(FORMAT_NOSTALGIA_PACK))) {
    const fmt = FORMAT_ICONS.find((f) => f.id === FORMAT_NOSTALGIA_PACK)!;
    badges.push({ icon: map.retro_map.preview_url, label: map.retro_map.name, slug: fmt.slug, squareImage: true });
  }

  return badges;
}
