import { createHash } from "crypto";
import { getRedis } from "./db";
import { PhotoRankResult } from "@/types/ai-assistant";

const PHOTO_CACHE_TTL = 60 * 60 * 24 * 7; // 7 days

function cacheKey(listingId: string, visualQuery: string): string {
  const hash = createHash("md5")
    .update(visualQuery.toLowerCase().trim())
    .digest("hex")
    .slice(0, 8);
  return `photo_rank:v2:${listingId}:${hash}`;
}

export async function getCachedRanking(
  listingId: string,
  visualQuery: string,
): Promise<PhotoRankResult | null> {
  try {
    const redis = getRedis();
    return redis.get<PhotoRankResult>(cacheKey(listingId, visualQuery));
  } catch {
    return null;
  }
}

export async function setCachedRanking(
  listingId: string,
  visualQuery: string,
  result: PhotoRankResult,
): Promise<void> {
  try {
    const redis = getRedis();
    await redis.set(cacheKey(listingId, visualQuery), result, {
      ex: PHOTO_CACHE_TTL,
    });
  } catch {
    // Non-critical — never break main flow
  }
}

/**
 * Batch lookup for all listing IDs at once.
 * Returns a Map of listingId → cached result (or null if not cached).
 */
export async function getBatchCachedRankings(
  listingIds: string[],
  visualQuery: string,
): Promise<Map<string, PhotoRankResult | null>> {
  const map = new Map<string, PhotoRankResult | null>();
  if (listingIds.length === 0) return map;

  try {
    const redis = getRedis();
    const values = await Promise.all(
      listingIds.map((id) =>
        redis.get<PhotoRankResult>(cacheKey(id, visualQuery)),
      ),
    );
    listingIds.forEach((id, i) => map.set(id, values[i]));
  } catch {
    // Cache unavailable — all listings will go through vision
    listingIds.forEach((id) => map.set(id, null));
  }

  return map;
}

/**
 * Write multiple rankings to cache in parallel (fire-and-forget safe).
 */
export async function setBatchCachedRankings(
  visualQuery: string,
  results: PhotoRankResult[],
): Promise<void> {
  await Promise.allSettled(
    results.map((r) => setCachedRanking(r.listingId, visualQuery, r)),
  );
}
