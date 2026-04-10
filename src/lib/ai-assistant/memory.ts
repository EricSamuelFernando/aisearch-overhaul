import { getRedis } from "./db";
import { BuyerProfile, AIAssistantMessage } from "@/types/ai-assistant";

const PROFILE_TTL = 60 * 60 * 24 * 90; // 90 days
const HISTORY_TTL = 60 * 60 * 24 * 30; // 30 days
const HISTORY_MAX = 40; // max messages stored per user

function profileKey(userId: string) { return `profile:${userId}`; }
function historyKey(userId: string) { return `history:${userId}`; }

const DEFAULT_PROFILE = (userId: string): BuyerProfile => ({
  userId,
  preferredLocations: [],
  budgetMin: null,
  budgetMax: null,
  bedroomsMin: null,
  bathroomsMin: null,
  mustHaves: [],
  dealBreakers: [],
  propertyTypes: [],
  lastUpdated: new Date().toISOString(),
});

export async function loadProfile(userId: string): Promise<BuyerProfile> {
  const redis = getRedis();
  const data = await redis.get<BuyerProfile>(profileKey(userId));
  return data ?? DEFAULT_PROFILE(userId);
}

export async function saveProfile(profile: BuyerProfile): Promise<void> {
  const redis = getRedis();
  await redis.set(profileKey(profile.userId), profile, { ex: PROFILE_TTL });
}

export async function loadHistory(userId: string, limit = 20): Promise<AIAssistantMessage[]> {
  const redis = getRedis();
  const items = await redis.lrange<AIAssistantMessage>(historyKey(userId), -limit, -1);
  return items ?? [];
}

export async function appendMessage(userId: string, message: AIAssistantMessage): Promise<void> {
  const redis = getRedis();
  const key = historyKey(userId);
  await redis.rpush(key, message);
  // Trim to max length and refresh TTL
  await redis.ltrim(key, -HISTORY_MAX, -1);
  await redis.expire(key, HISTORY_TTL);
}

export async function extractAndUpdateProfile(userId: string, text: string): Promise<void> {
  const match = text.match(/\[PROFILE_UPDATE\]([\s\S]*?)\[\/PROFILE_UPDATE\]/);
  if (!match) return;

  try {
    const updates = JSON.parse(match[1]);
    const current = await loadProfile(userId);
    const merged: BuyerProfile = {
      ...current,
      ...updates,
      preferredLocations: Array.from(new Set([...current.preferredLocations, ...(updates.preferredLocations ?? [])])),
      mustHaves: Array.from(new Set([...current.mustHaves, ...(updates.mustHaves ?? [])])),
      dealBreakers: Array.from(new Set([...current.dealBreakers, ...(updates.dealBreakers ?? [])])),
      propertyTypes: Array.from(new Set([...current.propertyTypes, ...(updates.propertyTypes ?? [])])),
    };
    await saveProfile(merged);
  } catch {
    // Malformed JSON — ignore
  }
}
