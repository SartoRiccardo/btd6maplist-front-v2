import { computed, type Ref } from 'vue';
import type { MaybeGhostMap } from '@/services/api/maps/types';
import { FORMAT_NOSTALGIA_PACK } from '@/constants/formats';

export interface MapGroup {
  subcategoryName?: string;
  maps: MaybeGhostMap[];
}

/**
 * Groups maps by subcategory for formats that need it (e.g. Nostalgia Pack).
 * Other formats return a single unnamed group.
 */
export function useMapGroups(
  maps: Ref<MaybeGhostMap[] | undefined>,
  formatId: Ref<number | undefined>,
) {
  return computed<MapGroup[] | undefined>(() => {
    const data = maps.value;
    if (!data) return undefined;

    if (formatId.value === FORMAT_NOSTALGIA_PACK) {
      return groupNostalgiaPack(data);
    }

    return [{ maps: data }];
  });
}

function groupNostalgiaPack(maps: MaybeGhostMap[]): MapGroup[] {
  const groupMap = new Map<number, { subcategoryName: string; retroGameId: number; maps: MaybeGhostMap[] }>();

  for (const map of maps) {
    const rg = map.retro_map?.game;
    if (!rg) {
      // Map without retro_map — put in a fallback group
      const fallback = groupMap.get(-1) ?? { subcategoryName: '', retroGameId: -1, maps: [] };
      fallback.maps.push(map);
      groupMap.set(-1, fallback);
      continue;
    }

    const key = rg.id;
    const existing = groupMap.get(key);
    if (existing) {
      existing.maps.push(map);
    } else {
      groupMap.set(key, {
        subcategoryName: rg.subcategory_name,
        retroGameId: rg.id,
        maps: [map],
      });
    }
  }

  return Array.from(groupMap.values())
    .sort((a, b) => a.retroGameId - b.retroGameId)
    .map((g) => {
      const sorted = [...g.maps].sort(
        (a, b) => (a.retro_map?.sort_order ?? 0) - (b.retro_map?.sort_order ?? 0),
      );
      return {
        subcategoryName: g.subcategoryName || undefined,
        maps: sorted,
      };
    });
}
