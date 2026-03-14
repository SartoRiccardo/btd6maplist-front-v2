const BASE_URL = 'https://data.ninjakiwi.com';

export interface NKCustomMap {
  creator: string;
  name: string;
}

export interface NKUser {
  displayName: string;
  avatarURL: string | null;
}

export async function getCustomMap(code: string): Promise<NKCustomMap | null> {
  const response = await fetch(`${BASE_URL}/btd6/maps/map/${code}`);
  if (!response.ok) return null;
  const result = await response.json();
  return result?.body ?? null;
}

export async function getBtd6User(oakOrUid: string): Promise<NKUser | null> {
  const response = await fetch(`${BASE_URL}/btd6/users/${oakOrUid}`);
  if (!response.ok) return null;
  const result = await response.json();
  return result?.body ?? null;
}
