import Supermemory from "supermemory";

const client = new Supermemory({
  apiKey: process.env.SUPERMEMORY_API_KEY,
});

// How long to wait for Supermemory before giving up.
// 500ms was too aggressive — cold starts and graph traversal need more time.
// 1500ms keeps us under Groq's window while giving Supermemory a real chance.
const MEMORY_FETCH_TIMEOUT_MS = 1500;

/**
 * Write a behavioral signal for a user.
 * Content should be pre-built by buildSearchMemoryContent / buildAnswerMemoryContent
 * from intelligence.ts — never pass raw listing dumps or full conversation text.
 * Fire-and-forget: never awaited on the hot path.
 */
export async function writeMemory(userId: string, content: string): Promise<void> {
  try {
    await client.documents.add({
      content,
      containerTags: [userId],
    });
  } catch (err) {
    console.warn("[Supermemory] write failed:", err instanceof Error ? err.message : err);
  }
}

/**
 * Retrieve the user's behavioral memory context for a given query.
 * Returns a labeled string ready to inject into the system prompt,
 * or empty string on timeout / error (graceful degradation).
 *
 * Timeout is intentionally generous — if Supermemory doesn't resolve
 * in time, the profile + Redis intelligence still give a strong context.
 */
export async function getUserMemoryContext(userId: string, query: string): Promise<string> {
  try {
    const result = await Promise.race([
      client.profile({ containerTag: userId, q: query, threshold: 0.5 }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), MEMORY_FETCH_TIMEOUT_MS)),
    ]);

    if (!result || !result.profile) return "";

    return `## Behavioral memory from previous sessions:\n${result.profile}`;
  } catch (err) {
    console.warn("[Supermemory] profile fetch failed:", err instanceof Error ? err.message : err);
    return "";
  }
}
