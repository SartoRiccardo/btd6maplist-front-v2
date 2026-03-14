import { FORMAT_EXPERT_LIST, FORMAT_BEST_OF_THE_BEST, FORMAT_NOSTALGIA_PACK } from './formats';

export interface Difficulty {
  name: string;
  query: string;
  value: number | number[];
  image: string;
  description: string;
}

export const EXPERT_DIFFICULTIES: Difficulty[] = [
  {
    name: 'Casual',
    query: 'casual',
    value: 0,
    image: '/images/list_icons/icon_casual.webp',
    description:
      'These maps are a great mix of fun and challenge\u2014tough enough to keep things interesting but not so hard that you\u2019ll get stuck for hours. Most towers work well here, so you\u2019ve got plenty of ways to win. If you\u2019ve beaten Workshop and Muddy Puddles and had a good time, you\u2019ll feel right at home with these.',
  },
  {
    name: 'Medium',
    query: 'medium',
    value: 1,
    image: '/images/list_icons/icon_medium.webp',
    description:
      'These maps step things up a notch, adding extra obstacles or mechanics that make you think more carefully about your strategy. They can get pretty tough at times, but they never feel unfair. If you\u2019ve beaten maps like Sanctuary and Flooded Valley, expect a similar level of challenge with some fresh twists.',
  },
  {
    name: 'High',
    query: 'hard',
    value: 2,
    image: '/images/list_icons/icon_hard.webp',
    description:
      'Things start getting serious here. These maps always have at least one part that\u2019s brutally tough\u2014usually in the lategame, where even small mistakes can ruin a run. You\u2019ll need to plan ahead and make smart moves to survive. If you\u2019ve handled Dark Dungeons and Quad, you\u2019ll know what to expect.',
  },
  {
    name: 'True',
    query: 'true',
    value: 3,
    image: '/images/list_icons/icon_true.webp',
    description:
      'If you\u2019re looking for a real challenge, these maps don\u2019t mess around. A lot of normal strategies just won\u2019t cut it, so you\u2019ll have to come up with new ways to win. Every round is a battle, and even small mistakes can send you back to square one. They\u2019re as tough as, or even harder than, Bloody Puddles and Ouch\u2014so if you want to prove you\u2019re one of the best, here\u2019s your chance.',
  },
  {
    name: 'Extreme',
    query: 'extreme',
    value: 4,
    image: '/images/list_icons/icon_extreme.webp',
    description:
      'The hardest of the hard, featuring even some maps which have fallen off The Maplist. These maps make official expert maps look easy, pushing the game to its absolute limit. You\u2019ll often need super-specific strategies just to stand a chance. If you\u2019re looking for the toughest CHIMPS runs ever made, this is it. Good luck...',
  },
];

export const BOTB_DIFFICULTIES: Difficulty[] = [
  {
    name: 'Beginner',
    query: 'beginner',
    value: 0,
    image: '/images/list_icons/icon_botb_1.png',
    description:
      'Simple, clean, and beautifully crafted \u2014 these maps are perfect for getting started or just enjoying the art of great design. Whether you\u2019re new to the game or just want to relax, feel free to breeze through and admire the smooth flow and charming aesthetics.',
  },
  {
    name: 'Intermediate',
    query: 'intermediate',
    value: 1,
    image: '/images/list_icons/icon_botb_2.png',
    description:
      'Ready to turn things up a notch? These maps introduce a bit more challenge, but nothing you haven\u2019t handled before. The gameplay stays fair and familiar, while the decoration steps things up with unique and polished visuals that bring every level to life.',
  },
  {
    name: 'Advanced',
    query: 'advanced',
    value: 2,
    image: '/images/list_icons/icon_botb_3.png',
    description:
      'You\u2019ll need solid game knowledge and sharper skills to push through the creative mechanics and complex layouts. While the visuals are still top-tier, the focus here shifts to serious gameplay. Expect to restart a few times \u2014 and enjoy the process.',
  },
  {
    name: 'Expert',
    query: 'expert',
    value: [3, 4],
    image: '/images/list_icons/icon_botb_4.png',
    description:
      'Beautiful and brutal. These maps are not for the faint of heart \u2014 they\u2019re punishing, strategic, and some have even earned spots on The Maplist and The Expert List. While the decoration may wow you, don\u2019t get too distracted. You\u2019ll need everything you\u2019ve learned (and then some) to make it through.',
  },
];

export const NP_DIFFICULTIES: Difficulty[] = [
  {
    name: 'BTD1/2/3',
    query: 'btd1_2_3',
    value: 0,
    image: '/images/list_icons/icon_np_1.png',
    description:
      'Travel all the way back to where it began! These maps are remakes and reimaginings of tracks from the original Bloons TD trilogy. Simple layouts, classic vibes, and a healthy dose of nostalgia \u2014 all brought to life with modern decoration.',
  },
  {
    name: 'iOS/PSN/DSi',
    query: 'btd_ios_psn_dsi',
    value: 1,
    image: '/images/list_icons/icon_np_2.png',
    description:
      'Faithful recreations from the iOS, PlayStation Network, and DSi versions of Bloons TD. These maps bring back platform-exclusive tracks that many players never got to experience \u2014 now reimagined for BTD6.',
  },
  {
    name: 'BTD4',
    query: 'bloons_td_4',
    value: 2,
    image: '/images/list_icons/icon_np_3.png',
    description:
      'Fan-favorite tracks from the BTD4 era, remade with love. These maps capture the spirit of a game that helped define the series, with familiar paths and fresh visuals.',
  },
  {
    name: 'BTD5',
    query: 'bloons_td_5',
    value: 3,
    image: '/images/list_icons/icon_np_4.png',
    description:
      'Remade maps from BTD5, capturing the tight track design and fun layouts that made it a fan favorite. Whether you remember them fondly or are discovering them for the first time, these maps deliver.',
  },
  {
    name: 'BTDB1',
    query: 'bloons_td_battles',
    value: 4,
    image: '/images/list_icons/icon_np_5.png',
    description:
      'Maps inspired by Bloons TD Battles, built for competitive strategy. These tracks were designed with head-to-head gameplay in mind, and they bring that same intensity to BTD6.',
  },
  {
    name: 'BMC',
    query: 'bloons_monkey_city',
    value: 5,
    image: '/images/list_icons/icon_np_6.png',
    description:
      'Maps from Bloons Monkey City, where world-building meets tower defense. These recreations bring back the charm of city-based gameplay with tracks that feel both strategic and nostalgic.',
  },
  {
    name: 'BATTD',
    query: 'bloons_adventure_time_td',
    value: 6,
    image: '/images/list_icons/icon_np_7.png',
    description:
      'Ports from Bloons Adventure Time TD, the crossover that brought the Land of Ooo into the Bloons universe. These maps blend whimsical design with solid gameplay.',
  },
  {
    name: 'BTDB2/BTD6',
    query: 'bloons_td_battles_2',
    value: 7,
    image: '/images/list_icons/icon_np_8.png',
    description:
      'Scrapped BTD6 or BTD Battles 2 maps that never made it into the final game \u2014 until now. These hidden gems have been rescued and rebuilt for everyone to enjoy.',
  },
];

export const FORMAT_DIFFICULTIES: Partial<Record<number, Difficulty[]>> = {
  [FORMAT_EXPERT_LIST]: EXPERT_DIFFICULTIES,
  [FORMAT_BEST_OF_THE_BEST]: BOTB_DIFFICULTIES,
  [FORMAT_NOSTALGIA_PACK]: NP_DIFFICULTIES,
};
