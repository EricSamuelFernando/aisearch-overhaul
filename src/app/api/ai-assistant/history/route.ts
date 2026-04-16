import { NextRequest, NextResponse } from "next/server";
import { loadHistory } from "@/lib/ai-assistant/memory";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ messages: [] });
  }

  try {
    const raw = await loadHistory(userId, 20);

    // Strip photos from listing objects — history tiles don't need photo arrays,
    // keeping the payload small for active users with many listing turns.
    const messages = raw.map((m) => ({
      ...m,
      listings: m.listings?.map(({ photos: _p, ...listing }) => listing),
    }));

    return NextResponse.json({ messages });
  } catch {
    return NextResponse.json({ messages: [] });
  }
}
