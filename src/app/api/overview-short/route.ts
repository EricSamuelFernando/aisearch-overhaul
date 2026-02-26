import { NextResponse } from "next/server"

type SummarizeRequest = {
  propertyId?: string
  overview?: string
}

const DEFAULT_CHAT_COMPLETIONS_URL = "https://router.huggingface.co/v1/chat/completions"
const DEFAULT_MODEL = "openai/gpt-oss-20b"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SummarizeRequest
    const overview = String(body?.overview || "").trim()

    if (!overview) {
      return NextResponse.json({ error: "overview is required" }, { status: 400 })
    }

    const apiKey =
      process.env.HUGGINGFACE_API_KEY ||
      process.env.HF_API_KEY ||
      process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing summarize API key. Set HUGGINGFACE_API_KEY (or HF_API_KEY)." },
        { status: 500 },
      )
    }

    const chatCompletionsUrl =
      process.env.OVERVIEW_SHORT_CHAT_COMPLETIONS_URL ||
      process.env.HUGGINGFACE_CHAT_COMPLETIONS_URL ||
      process.env.OPENAI_CHAT_COMPLETIONS_URL ||
      DEFAULT_CHAT_COMPLETIONS_URL

    const model =
      process.env.OVERVIEW_SHORT_MODEL ||
      process.env.HUGGINGFACE_GPT_OSS_MODEL ||
      DEFAULT_MODEL

    const systemPrompt =
      "You summarize real-estate listing overviews. Return 2-3 concise sentences in plain language. Do not use bullets. Do not add facts not present in the text."

    const userPrompt = `Summarize this property overview:\n\n${overview}`

    const response = await fetch(chatCompletionsUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 180,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    })

    if (!response.ok) {
      const details = await response.text()
      return NextResponse.json(
        { error: "Failed to summarize overview", details },
        { status: 500 },
      )
    }

    const json = await response.json()
    const summary = String(json?.choices?.[0]?.message?.content || "").trim()

    if (!summary) {
      return NextResponse.json(
        { error: "Summarizer returned empty content" },
        { status: 502 },
      )
    }

    return NextResponse.json({
      propertyId: body?.propertyId || null,
      overview_short: summary,
      model,
    })
  } catch {
    return NextResponse.json(
      { error: "Unexpected error while summarizing overview" },
      { status: 500 },
    )
  }
}

