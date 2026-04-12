import type { ChatRequestBody, ChatResponseBody } from "@/types/chat";
import { retrieveForIntent } from "@/lib/rag/retrieve";
import { detectIntent } from "./intentDetector";
import { buildSystemPrompt } from "./promptBuilder";
import { groqChat } from "./groq";
import { openRouterChat } from "./openrouter";
import { mockAnswer } from "./mock";

function relatedForIntent(intent: string): string[] {
  const map: Record<string, string[]> = {
    exam_intent: ["When are semester exams?", "Supplementary exam rules", "Library weekend hours"],
    fee_intent: ["Scholarship application process", "Hostel fees", "Payment installments"],
    contact_intent: ["Admissions email", "Visit campus", "Official website"],
    research_intent: ["Faculty directory", "CSE research areas", "MBA capstone projects"],
    general_intent: ["B.Tech admission process", "Placement statistics", "Transport routes"],
    unknown_intent: ["Show fee structure", "How can I connect?", "Research portal"],
  };
  return map[intent] ?? map.general_intent;
}

export async function generateAnswer(body: ChatRequestBody): Promise<ChatResponseBody> {
  const collegeName = process.env.NEXT_PUBLIC_COLLEGE_NAME || "Demo University";
  const lastUser = [...body.messages].reverse().find((m) => m.role === "user");
  const userText = lastUser?.content ?? "";
  const intent = detectIntent(userText);

  const useStructuredFirst =
    intent === "unknown_intent" ||
    intent === "fee_intent" ||
    intent === "contact_intent" ||
    intent === "research_intent" ||
    intent === "exam_intent";

  const retrieval = retrieveForIntent(intent === "exam_intent" ? "exam_intent" : intent, userText);
  const sources = retrieval.sources;

  const groqKey = process.env.GROQ_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const groqModel = process.env.AI_MODEL || "llama-3.1-8b-instant";
  const openRouterModel = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.1-8b-instant:free";

  let mode: "live" | "demo" = "demo";
  let provider = "mock";

  const examFollowUp = Boolean(body.expectingExamFollowUp);

  if (useStructuredFirst) {
    const m = mockAnswer({
      intent,
      userMessage: userText,
      expectingExamFollowUp: examFollowUp,
    });

    if (m.needsExamFollowUp) {
      return {
        content: m.content,
        sources,
        confidence: m.confidence,
        related: relatedForIntent(intent),
        intent,
        mode: groqKey ? "live" : "demo",
        provider: groqKey ? "groq-pending" : "mock",
        needsExamFollowUp: true,
      };
    }

    if (!groqKey && !openRouterKey) {
      return {
        content: m.content,
        sources,
        confidence: m.confidence,
        related: relatedForIntent(intent),
        uiBlocks: m.uiBlocks,
        intent,
        mode: "demo",
        provider: "mock",
      };
    }

    try {
      const system = buildSystemPrompt({
        userRole: body.userRole,
        context: retrieval.context,
        collegeName,
        preferredLanguage: body.preferredLanguage,
      });
      const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
        { role: "system", content: system },
        ...body.messages.slice(-8).map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        {
          role: "user",
          content:
            "Polish the following draft for the user. Keep facts consistent with KNOWLEDGE BLOCK. Do not remove required portal links if present.\n\nDRAFT:\n" +
            m.content,
        },
      ];

      let text: string;
      if (groqKey) {
        text = await groqChat({ apiKey: groqKey, model: groqModel, messages });
        mode = "live";
        provider = "groq";
      } else if (openRouterKey) {
        text = await openRouterChat({ apiKey: openRouterKey, model: openRouterModel, messages });
        mode = "live";
        provider = "openrouter";
      } else {
        text = m.content;
      }

      return {
        content: text,
        sources,
        confidence: m.confidence,
        related: relatedForIntent(intent),
        uiBlocks: m.uiBlocks,
        intent,
        mode,
        provider,
      };
    } catch {
      return {
        content: m.content,
        sources,
        confidence: m.confidence,
        related: relatedForIntent(intent),
        uiBlocks: m.uiBlocks,
        intent,
        mode: "demo",
        provider: "mock-fallback",
        error: "Live model unavailable; showing grounded draft.",
      };
    }
  }

  // general_intent → LLM with retrieval, else mock
  if (!groqKey && !openRouterKey) {
    const m = mockAnswer({
      intent: "general_intent",
      userMessage: userText,
      expectingExamFollowUp: false,
    });
    return {
      content: m.content,
      sources,
      confidence: "medium",
      related: relatedForIntent("general_intent"),
      intent: "general_intent",
      mode: "demo",
      provider: "mock",
    };
  }

  try {
    const system = buildSystemPrompt({
      userRole: body.userRole,
      context: retrieval.context,
      collegeName,
      preferredLanguage: body.preferredLanguage,
    });
    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: system },
      ...body.messages.slice(-10).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    let text: string;
    if (groqKey) {
      text = await groqChat({ apiKey: groqKey, model: groqModel, messages });
      mode = "live";
      provider = "groq";
    } else {
      text = await openRouterChat({ apiKey: openRouterKey!, model: openRouterModel, messages });
      mode = "live";
      provider = "openrouter";
    }

    return {
      content: text,
      sources,
      confidence: "high",
      related: relatedForIntent("general_intent"),
      intent: "general_intent",
      mode,
      provider,
    };
  } catch (e) {
    const m = mockAnswer({
      intent: "general_intent",
      userMessage: userText,
      expectingExamFollowUp: false,
    });
    return {
      content: m.content,
      sources,
      confidence: "low",
      related: relatedForIntent("general_intent"),
      intent: "general_intent",
      mode: "demo",
      provider: "mock-fallback",
      error: e instanceof Error ? e.message : "Model error",
    };
  }
}
