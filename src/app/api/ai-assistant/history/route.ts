import { NextRequest, NextResponse } from "next/server";
import { loadHistory } from "@/lib/ai-assistant/memory";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ messages: [] });
  }

  try {
    const raw = await loadHistory(userId, 40);

    // Keep only the first 3 photos per listing — enough for history tile thumbnails
    // without sending full 20-photo arrays across the wire.
    const messages = raw.map((m) => ({
      ...m,
      listings: m.listings?.map(({ photos, ...listing }) => ({
        ...listing,
        photos: (photos ?? []).slice(0, 3),
      })),
    }));

    return NextResponse.json({ messages });
  } catch {
    return NextResponse.json({ messages: [] });
  }
}
