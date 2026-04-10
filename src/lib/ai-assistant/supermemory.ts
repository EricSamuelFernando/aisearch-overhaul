import Supermemory from "supermemory";

const client = new Supermemory({
  apiKey: process.env.SUPERMEMORY_API_KEY,
});

/**
 * Write a memory for a user.
 * Call this after every meaningful interaction — searches, preferences, reactions.
 */
export async function writeMemory(userId: string, content: string): Promise<void> {
  try {
    await client.documents.add({
      content,
      containerTags: [userId],
    });
  } catch (err) {
    // Memory writes are non-critical — never let them break the main flow
    console.warn("[Memory] write failed:", err instanceof Error ? err.message : err);
  }
}

/**
 * Retrieve a rich profile for the user — past searches, preferences, behaviors.
 * Returns a plain string ready to be injected into the system prompt.
 * Falls back to empty string on error so the assistant still responds.
 */
export async function getUserMemoryContext(userId: string, query: string): Promise<string> {
  try {
    const profile = await Promise.race([
      client.profile({ containerTag: userId, q: query, threshold: 0.5 }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 500)),
    ]);

    if (!profile || !profile.profile) return "";

    return `## User Memory\n${profile.profile}`;
  } catch (err) {
    console.warn("[Memory] profile fetch failed:", err instanceof Error ? err.message : err);
    return "";
  }
}
