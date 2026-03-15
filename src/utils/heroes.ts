const HERO_ALIASES: Record<string, string> = {
  benjamin: 'ben',
};

export function heroId(name: string): string {
  const normalized = name.toLowerCase().replace(/ /g, '_');
  return HERO_ALIASES[normalized] ?? normalized;
}
