import { NextRequest, NextResponse } from "next/server";

const UPSTREAM = "https://demo-api.snaphomz.com/auth/graphql";

export async function POST(req: NextRequest) {
  const body = await req.text();

  const upstream = await fetch(UPSTREAM, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(req.headers.get("authorization")
        ? { Authorization: req.headers.get("authorization")! }
        : {}),
    },
    body,
  });

  const data = await upstream.json();
  return NextResponse.json(data, { status: upstream.status });
}
