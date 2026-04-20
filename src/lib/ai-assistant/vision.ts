import Anthropic from "@anthropic-ai/sdk";
import { MLSListing, PhotoRankResult } from "@/types/ai-assistant";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const VISION_MODEL_FAST    = "claude-haiku-4-5-20251001";
const VISION_MODEL_PRECISE = "claude-sonnet-4-6";

// Timeout slightly higher than before — we now send up to 20 photos instead of 12
const TIMEOUT_FAST_MS    = 15000;
const TIMEOUT_PRECISE_MS = 25000;

// Sonnet only retries a listing when Haiku found a PARTIAL match (score > 0 but < threshold)
// A score of exactly 0.0 means "nothing there" — Sonnet won't find what Haiku couldn't
const SONNET_FALLBACK_THRESHOLD = 0.3;

// Never run more than 3 Sonnet calls per search regardless of listing count
const SONNET_MAX_RETRIES = 3;

/**
 * Two-pass vision ranking:
 *   Pass 1 — Haiku on all listings in parallel (fast, cheap)
 *   Pass 2 — Sonnet on listings where Haiku found a partial match only (capped at 3)
 */
export async function rankListingPhotos(
  listings: MLSListing[],
  visualQuery: string,
  roomHint: string = "any",
  visualConfidence: "high" | "medium" | "low" = "medium",
): Promise<PhotoRankResult[]> {

  // ── Pass 1: Haiku on all listings in parallel ─────────────────────────────
  const haikuSettled = await Promise.allSettled(
    listings.map((listing) =>
      runVisionForListing(listing, VISION_MODEL_FAST, TIMEOUT_FAST_MS, visualQuery, roomHint),
    ),
  );

  const results: PhotoRankResult[] = haikuSettled.map((r, i) => {
    if (r.status === "fulfilled") return r.value;
    console.warn(`[Vision] Haiku failed for ${listings[i].id}:`, r.reason);
    return { listingId: listings[i].id, rankedPhotos: listings[i].photos ?? [], bestScore: 0 };
  });

  // ── Pass 2: Sonnet fallback — only for "high" confidence queries ──────────
  // Only retry listings where Haiku found SOMETHING (score > 0) but wasn't sure (< threshold)
  // Never retry 0.0 — that means Haiku looked at all photos and found nothing
  if (visualConfidence === "high") {
    const candidates = results
      .map((r, i) => ({ result: r, index: i, listing: listings[i] }))
      .filter(({ result }) => result.bestScore > 0 && result.bestScore < SONNET_FALLBACK_THRESHOLD)
      .slice(0, SONNET_MAX_RETRIES);

    if (candidates.length > 0) {
      console.log(`[Vision] Sonnet fallback for ${candidates.length} listing(s) with partial Haiku match`);

      const sonnetSettled = await Promise.allSettled(
        candidates.map(({ listing }) =>
          runVisionForListing(listing, VISION_MODEL_PRECISE, TIMEOUT_PRECISE_MS, visualQuery, roomHint),
        ),
      );

      sonnetSettled.forEach((sr, i) => {
        const { result, index } = candidates[i];
        if (sr.status === "fulfilled" && sr.value.bestScore > result.bestScore) {
          console.log(
            `[Vision] Sonnet improved: ${result.bestScore.toFixed(2)} → ${sr.value.bestScore.toFixed(2)} for ${result.listingId}`,
          );
          results[index] = sr.value;
        } else if (sr.status === "rejected") {
          console.warn(`[Vision] Sonnet fallback failed for ${result.listingId}:`, sr.reason);
        }
      });
    }
  }

  return results;
}

/**
 * Resolves a photo URL to base64 for Claude's vision API.
 * Photos are stored as proxy paths (/api/photo?url=...) — we decode and fetch
 * server-side with the CDN auth header, then send as base64.
 */
async function fetchPhotoAsBase64(
  proxyOrDirectUrl: string,
): Promise<{ mediaType: string; data: string } | null> {
  try {
    let targetUrl = proxyOrDirectUrl;
    if (proxyOrDirectUrl.startsWith('/api/photo?url=')) {
      targetUrl = decodeURIComponent(proxyOrDirectUrl.slice('/api/photo?url='.length));
    }
    const res = await fetch(targetUrl, {
      headers: {
        'x-api-key': process.env.REALESTATE_API_KEY ?? '',
        'Referer': 'https://realestateapi.com',
        'User-Agent': 'Snaphomz/1.0',
      },
    });
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    const data = Buffer.from(buffer).toString('base64');
    const mediaType = (res.headers.get('content-type') ?? 'image/jpeg').split(';')[0].trim();
    return { mediaType, data };
  } catch {
    return null;
  }
}

async function runVisionForListing(
  listing: MLSListing,
  model: string,
  timeoutMs: number,
  visualQuery: string,
  roomHint: string,
): Promise<PhotoRankResult> {
  const photos = listing.photos ?? [];
  if (photos.length === 0) {
    return { listingId: listing.id, rankedPhotos: [], bestScore: 0 };
  }

  // Send ALL available photos (up to 20) — the model identifies rooms itself
  // No hardcoded position ranges: the model knows what a kitchen looks like
  const photosToScore = photos.slice(0, 20);

  // Fetch all photos as base64 in parallel (CDN requires auth — can't pass URL directly to Claude)
  const photoData = await Promise.all(photosToScore.map((url) => fetchPhotoAsBase64(url)));

  // Only score photos that loaded successfully; track original indices for result mapping
  const validPhotos = photosToScore
    .map((url, i) => ({ url, b64: photoData[i] }))
    .filter((p): p is { url: string; b64: { mediaType: string; data: string } } => p.b64 !== null);

  if (validPhotos.length === 0) {
    return { listingId: listing.id, rankedPhotos: photos, bestScore: 0 };
  }

  // Room filter instruction — if a specific room is requested, the model must score
  // photos of OTHER rooms as 0.0. This replaces brittle position-based selection.
  const roomFilter =
    roomHint !== "any"
      ? `\nTarget room: ${roomHint}. Any photo that is NOT a ${roomHint} must be scored 0.0, regardless of other content.`
      : "";

  const scoringPrompt = `You are scoring real estate listing photos. The user wants: "${visualQuery}".${roomFilter}

Score each photo 0.0–1.0:
- 0.9–1.0: feature clearly and unmistakably visible in the correct room
- 0.5–0.8: feature partially visible or likely present in the correct room
- 0.1–0.4: feature not clearly visible, or uncertain room type
- 0.0: wrong room type, OR the feature is simply not present

Respond ONLY with a JSON array of numbers, one per photo, in order.
Example for 4 photos: [0.0, 0.85, 0.0, 0.1]
No explanation. Just the array.`;

  const imageContent: Anthropic.MessageParam["content"] = validPhotos.flatMap(({ b64 }, i) => [
    { type: "text" as const, text: `Photo ${i + 1}:` },
    {
      type: "image" as const,
      source: {
        type: "base64" as const,
        media_type: b64.mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
        data: b64.data,
      },
    },
  ]);

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Vision timed out after ${timeoutMs}ms`)), timeoutMs),
  );

  const apiPromise = anthropic.messages.create({
    model,
    max_tokens: 200,
    temperature: 0,
    messages: [{ role: "user", content: [...imageContent, { type: "text", text: scoringPrompt }] }],
  });

  let scores: number[];
  try {
    const response = await Promise.race([apiPromise, timeoutPromise]);
    const raw = response.content[0].type === "text" ? response.content[0].text.trim() : "[]";
    const startIdx = raw.indexOf("[");
    const endIdx   = raw.lastIndexOf("]");
    const jsonStr  = startIdx !== -1 && endIdx !== -1 ? raw.slice(startIdx, endIdx + 1) : "[]";
    const parsed = JSON.parse(jsonStr);
    scores = Array.isArray(parsed) ? parsed : Array(photosToScore.length).fill(0);
  } catch (err) {
    console.warn(
      `[Vision] Claude call failed for ${listing.id}:`,
      err instanceof Error ? err.message : err,
    );
    return { listingId: listing.id, rankedPhotos: photos, bestScore: 0 };
  }

  // Pair valid photos with scores and sort descending
  const scored = validPhotos.map(({ url }, i) => ({
    url,
    score: typeof scores[i] === "number" ? scores[i] : 0,
  }));
  scored.sort((a, b) => b.score - a.score);

  // Unscored photos (failed to fetch) go to the end
  const unscoredUrls = photosToScore.filter((u) => !validPhotos.find((v) => v.url === u));

  return {
    listingId: listing.id,
    rankedPhotos: [...scored.map((s) => s.url), ...unscoredUrls],
    bestScore: scored[0]?.score ?? 0,
  };
}
