<script setup lang="ts">
import { useI18n } from "vue-i18n";
import MarkdownContent from "@/components/common/MarkdownContent.vue";

const { t } = useI18n({ inheritLocale: true });
</script>

<template>
  <MarkdownContent :text="t('cheatsheet')" />
</template>

<i18n lang="json">
{
  "en": {
    "cheatsheet": "\n## Medals\n| Code | Icon | Description |\n|------|------|-------------|\n| \\`:completion:\\` | :completion: | CHIMPS completion |\n| \\`:black_border:\\` | :black_border: | Black Border |\n| \\`:no_geraldo:\\` or \\`:no_optimal_hero:\\` | :no_geraldo: | No Optimal Hero |\n| \\`:lcc:\\` | :lcc: | Least Cash CHIMPS |\n\n## Formats\n| Code | Icon | Description |\n|------|------|-------------|\n| \\`:maplist:\\` | :maplist: | Maplist |\n| \\`:maplist_all_versions:\\` | :maplist_all_versions: | All Versions |\n| \\`:expert_list:\\` or \\`:explist:\\` | :expert_list: | Expert List |\n| \\`:best_of_the_best:\\` or \\`:botb:\\` | :best_of_the_best: | Best of the Best |\n| \\`:nostalgia_pack:\\` or \\`:np:\\` | :nostalgia_pack: | Nostalgia Pack |\n\n## Expert List Difficulties\n| Code | Icon | Description |\n|------|------|-------------|\n| \\`:explist_casual:\\` | :explist_casual: | Casual |\n| \\`:explist_medium:\\` | :explist_medium: | Medium |\n| \\`:explist_hard:\\` | :explist_hard: | High |\n| \\`:explist_true:\\` | :explist_true: | True |\n| \\`:explist_extreme:\\` | :explist_extreme: | Extreme |\n\n## Best of the Best Difficulties\n| Code | Icon | Description |\n|------|------|-------------|\n| \\`:botb_beginner:\\` | :botb_beginner: | Beginner |\n| \\`:botb_intermediate:\\` | :botb_intermediate: | Intermediate |\n| \\`:botb_advanced:\\` | :botb_advanced: | Advanced |\n| \\`:botb_expert:\\` | :botb_expert: | Expert |\n\n## Nostalgia Pack Games\n| Code | Icon | Description |\n|------|------|-------------|\n| \\`:np_btd1:\\` | :np_btd1: | BTD1/2/3 |\n| \\`:np_ios:\\` | :np_ios: | iOS/PSN/DSi |\n| \\`:np_btd4:\\` | :np_btd4: | BTD4 |\n| \\`:np_btd5:\\` | :np_btd5: | BTD5 |\n| \\`:np_btdb1:\\` | :np_btdb1: | BTDB1 |\n| \\`:np_bmc:\\` | :np_bmc: | BMC |\n| \\`:np_battd:\\` | :np_battd: | BATTD |\n| \\`:np_btdb2:\\` | :np_btdb2: | BTDB2/BTD6 |\n\n## Border Variant\nWrap the icon name in parentheses to add a badge border: \\`:(icon_name):\\`\n\n| Code | Result |\n|------|--------|\n| \\`:(maplist):\\` | :(maplist): |\n| \\`:(completion):\\` | :(completion): |\n"
  }
}
</i18n>
