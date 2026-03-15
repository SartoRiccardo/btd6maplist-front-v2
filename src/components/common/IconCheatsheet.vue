<script setup lang="ts">
import MarkdownContent from '@/components/common/MarkdownContent.vue';

const cheatsheet = `
## Medals
| Code | Icon | Description |
|------|------|-------------|
| \`:completion:\` | :completion: | CHIMPS completion |
| \`:black_border:\` | :black_border: | Black Border |
| \`:no_geraldo:\` or \`:no_optimal_hero:\` | :no_geraldo: | No Optimal Hero |
| \`:lcc:\` | :lcc: | Least Cash CHIMPS |

## Formats
| Code | Icon | Description |
|------|------|-------------|
| \`:maplist:\` | :maplist: | Maplist |
| \`:maplist_all_versions:\` | :maplist_all_versions: | All Versions |
| \`:expert_list:\` or \`:explist:\` | :expert_list: | Expert List |
| \`:best_of_the_best:\` or \`:botb:\` | :best_of_the_best: | Best of the Best |
| \`:nostalgia_pack:\` or \`:np:\` | :nostalgia_pack: | Nostalgia Pack |

## Expert List Difficulties
| Code | Icon | Description |
|------|------|-------------|
| \`:explist_casual:\` | :explist_casual: | Casual |
| \`:explist_medium:\` | :explist_medium: | Medium |
| \`:explist_hard:\` | :explist_hard: | High |
| \`:explist_true:\` | :explist_true: | True |
| \`:explist_extreme:\` | :explist_extreme: | Extreme |

## Best of the Best Difficulties
| Code | Icon | Description |
|------|------|-------------|
| \`:botb_beginner:\` | :botb_beginner: | Beginner |
| \`:botb_intermediate:\` | :botb_intermediate: | Intermediate |
| \`:botb_advanced:\` | :botb_advanced: | Advanced |
| \`:botb_expert:\` | :botb_expert: | Expert |

## Nostalgia Pack Games
| Code | Icon | Description |
|------|------|-------------|
| \`:np_btd1:\` | :np_btd1: | BTD1/2/3 |
| \`:np_ios:\` | :np_ios: | iOS/PSN/DSi |
| \`:np_btd4:\` | :np_btd4: | BTD4 |
| \`:np_btd5:\` | :np_btd5: | BTD5 |
| \`:np_btdb1:\` | :np_btdb1: | BTDB1 |
| \`:np_bmc:\` | :np_bmc: | BMC |
| \`:np_battd:\` | :np_battd: | BATTD |
| \`:np_btdb2:\` | :np_btdb2: | BTDB2/BTD6 |

## Border Variant
Wrap the icon name in parentheses to add a badge border: \`:(icon_name):\`

| Code | Result |
|------|--------|
| \`:(maplist):\` | :(maplist): |
| \`:(completion):\` | :(completion): |
`.trim();
</script>

<template>
  <MarkdownContent :text="cheatsheet" />
</template>
