export const HEROES = [
  'adora',
  'ben',
  'brickell',
  'churchill',
  'corvus',
  'etienne',
  'ezili',
  'geraldo',
  'gwen',
  'obyn',
  'pat',
  'psi',
  'quincy',
  'rosalia',
  'sauda',
  'silas',
  'striker_jones',
] as const;

export type Hero = (typeof HEROES)[number];

export function heroImageUrl(hero: Hero): string {
  return `/images/heros/hero_${hero}.webp`;
}

export function heroDisplayName(hero: Hero): string {
  return hero
    .split('_')
    .map((w) => w[0]!.toUpperCase() + w.slice(1))
    .join(' ');
}
