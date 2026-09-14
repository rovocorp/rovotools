import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVORITES_KEY = "rovotools:favorites";
const RECENTS_KEY = "rovotools:recents";
export const MAX_RECENTS = 10;

async function readIds(key: string): Promise<Array<string>> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

async function writeIds(key: string, ids: Array<string>): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(ids));
  } catch {
    // Persistence is best-effort on device.
  }
}

export async function getFavoriteIds(): Promise<Array<string>> {
  return readIds(FAVORITES_KEY);
}

export async function toggleFavoriteId(toolId: string): Promise<Array<string>> {
  const ids = await readIds(FAVORITES_KEY);
  const next = ids.includes(toolId) ? ids.filter((id) => id !== toolId) : [...ids, toolId];
  await writeIds(FAVORITES_KEY, next);
  return next;
}

export async function getRecentIds(): Promise<Array<string>> {
  return readIds(RECENTS_KEY);
}

export async function trackRecentId(toolId: string): Promise<Array<string>> {
  const ids = await readIds(RECENTS_KEY);
  const next = [toolId, ...ids.filter((id) => id !== toolId)].slice(0, MAX_RECENTS);
  await writeIds(RECENTS_KEY, next);
  return next;
}

export async function clearRecentIds(): Promise<void> {
  await writeIds(RECENTS_KEY, []);
}

export async function clearAllLocalData(): Promise<void> {
  await writeIds(FAVORITES_KEY, []);
  await writeIds(RECENTS_KEY, []);
}
