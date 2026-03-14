const BASE_URL = 'https://data.ninjakiwi.com';

export interface NKCustomMap {
  creator: string;
  name: string;
}

export async function getCustomMap(code: string): Promise<NKCustomMap | null> {
  const response = await fetch(`${BASE_URL}/btd6/maps/map/${code}`);
  if (!response.ok) return null;
  const result = await response.json();
  return result?.body ?? null;
}
