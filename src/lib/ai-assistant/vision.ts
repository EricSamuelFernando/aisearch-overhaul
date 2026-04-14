import Anthropic from "@anthropic-ai/sdk";
import { MLSListing, PhotoRankResult } from "@/types/ai-assistant";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Claude Haiku: fast, cheap, reliable vision — ~$0.0005 per listing scan
const VISION_MODEL = "claude-haiku-4-5-20251001";

// Max ms per listing — prevents one slow call blocking others
const VISION_CALL_TIMEOUT_MS = 10000;

/**
 * Score and reorder photos for all listings in parallel.
 * Uses Promise.allSettled so one failed call never blocks others.
 */
export async function rankListingPhotos(
  listings: MLSListing[],
  visualQuery: string,
  roomHint: string = "any",
): Promise<PhotoRankResult[]> {
  const results = await Promise.allSettled(
    listings.map((listing) => rankSingleListing(listing, visualQuery, roomHint)),
  );

  return results.map((r, i) => {
    if (r.status === "fulfilled") return r.value;
    console.warn(`[Vision] ranking failed for listing ${listings[i].id}:`, r.reason);
    return {
      listingId: listings[i].id,
      rankedPhotos: listings[i].photos ?? [],
      bestScore: 0,
    };
  });
}

async function rankSingleListing(
  listing: MLSListing,
  visualQuery: string,
  roomHint: string,
): Promise<PhotoRankResult> {
  const photos = listing.photos ?? [];

  if (photos.length === 0) {
    return { listingId: listing.id, rankedPhotos: [], bestScore: 0 };
  }

  // Score up to 12 photos — MLS orders exterior first, interior (kitchen/bath) later
  const photosToScore = photos.slice(0, 12);

  const roomContext = roomHint !== "any" ? ` Focus on the ${roomHint}.` : "";

  const scoringPrompt = `You are scoring real estate listing photos. The user wants to see: "${visualQuery}".${roomContext}

Score each photo 0.0–1.0:
- 0.9–1.0: feature clearly visible and matches well
- 0.5–0.8: feature partially visible or likely present
- 0.0–0.4: feature not visible or wrong room/area

Respond ONLY with a JSON array of numbers, one per photo, in order.
Example for 3 photos: [0.85, 0.1, 0.4]
No explanation. Just the array.`;

  // Build multimodal content: interleave label + image for each photo
  const imageContent: Anthropic.MessageParam["content"] = photosToScore.flatMap(
    (url, i) => [
      { type: "text" as const, text: `Photo ${i + 1}:` },
      {
        type: "image" as const,
        source: { type: "url" as const, url },
      },
    ],
  );

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new Error(`Vision timed out after ${VISION_CALL_TIMEOUT_MS}ms`)),
      VISION_CALL_TIMEOUT_MS,
    ),
  );

  let scores: number[];
  try {
    const apiPromise = anthropic.messages.create({
      model: VISION_MODEL,
      max_tokens: 100,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: [...imageContent, { type: "text", text: scoringPrompt }],
        },
      ],
    });

    const response = await Promise.race([apiPromise, timeoutPromise]);
    const raw =
      response.content[0].type === "text" ? response.content[0].text.trim() : "[]";

    // Extract JSON array — handle model adding extra text
    const match = raw.match(/\[[\d.,\s]+\]/);
    const jsonStr = match ? match[0] : raw;

    try {
      const parsed = JSON.parse(jsonStr);
      scores = Array.isArray(parsed) ? parsed : Array(photosToScore.length).fill(0);
    } catch {
      scores = Array(photosToScore.length).fill(0);
    }
  } catch (err) {
    console.warn(
      `[Vision] Claude call failed for ${listing.id}:`,
      err instanceof Error ? err.message : err,
    );
    return { listingId: listing.id, rankedPhotos: photos, bestScore: 0 };
  }

  // Pair each photo with its score, sort descending
  const scored = photosToScore.map((url, i) => ({
    url,
    score: typeof scores[i] === "number" ? scores[i] : 0,
  }));
  scored.sort((a, b) => b.score - a.score);

  // Append any photos beyond index 8 (unscored) at the end
  const unscoredPhotos = photos.slice(12);
  const rankedPhotos = [...scored.map((s) => s.url), ...unscoredPhotos];

  return {
    listingId: listing.id,
    rankedPhotos,
    bestScore: scored[0]?.score ?? 0,
  };
}
