import { NextRequest, NextResponse } from "next/server";
import { mergeGuestProfile } from "@/lib/ai-assistant/memory";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { guestId, realUserId } = await req.json();

    if (!guestId || !realUserId || guestId === realUserId) {
      return NextResponse.json({ migratedConvId: null });
    }

    const migratedConvId = await mergeGuestProfile(guestId, realUserId);
    return NextResponse.json({ migratedConvId });
  } catch (err) {
    console.error("[merge-guest]", err instanceof Error ? err.message : err);
    return NextResponse.json({ migratedConvId: null }, { status: 500 });
  }
}
