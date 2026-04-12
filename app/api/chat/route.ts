import { NextResponse } from "next/server";
import { generateAnswer } from "@/lib/ai/provider";
import type { ChatRequestBody } from "@/types/chat";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const started = Date.now();
  try {
    const body = (await req.json()) as ChatRequestBody;
    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const result = await generateAnswer(body);
    return NextResponse.json({ ...result, responseTimeMs: Date.now() - started });
  } catch (e) {
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : "Server error",
        content:
          "Something went wrong. Please try again. Demo knowledge base is still available from the Knowledge page.",
        sources: [],
        confidence: "low" as const,
        related: ["Fee structure", "Contact", "Admissions"],
        intent: "unknown_intent" as const,
        mode: "demo" as const,
        provider: "error",
        responseTimeMs: Date.now() - started,
      },
      { status: 200 }
    );
  }
}
