import { NextRequest, NextResponse } from "next/server";
import { loadHistory, loadConversationIndex, type ConversationMeta } from "@/lib/ai-assistant/memory";
import type { AIAssistantMessage } from "@/types/ai-assistant";

export const runtime = "nodejs";

function trimPhotos(messages: AIAssistantMessage[]) {
  return messages.map((m) => ({
    ...m,
    listings: m.listings?.map(({ photos, ...listing }) => ({
      ...listing,
      photos: (photos ?? []).slice(0, 3),
    })),
  }));
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const mode   = req.nextUrl.searchParams.get("mode");
  const convId = req.nextUrl.searchParams.get("convId");

  if (!userId) return NextResponse.json({ messages: [], conversations: [] as ConversationMeta[] });

  try {
    if (mode === "conversations") {
      const conversations = await loadConversationIndex(userId, 5);
      return NextResponse.json({ conversations });
    }

    const raw = await loadHistory(userId, 40, convId ?? undefined);
    return NextResponse.json({ messages: trimPhotos(raw) });
  } catch {
    return NextResponse.json({ messages: [], conversations: [] as ConversationMeta[] });
  }
}
