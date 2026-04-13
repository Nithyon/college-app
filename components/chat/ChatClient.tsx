"use client";

import { useCallback, useMemo, useState } from "react";
import { useChatStore } from "@/stores/useChatStore";
import { useAnalyticsStore } from "@/stores/useAnalyticsStore";
import type { ChatMessage, ChatResponseBody, UserRole } from "@/types/chat";
import { UiBlocksRenderer } from "@/components/shared/UiBlocks";
import { useSpeechRecognition, useSpeechSynthesis } from "@/hooks/useSpeech";
import { CenteredContainer } from "@/components/layout/CenteredContainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const categories = [
  "Admissions",
  "Academics",
  "Fees & Scholarships",
  "Exams",
  "Placements",
  "Campus Facilities",
  "Hostel / Transport",
  "Events & Clubs",
  "Rules & Policies",
  "Connect With Us",
  "Research & Faculty",
];

const demoPrompts = [
  "What is the admission process for B.Tech?",
  "What are the hostel fees?",
  "What were placement statistics last year?",
  "What is the library timing on weekends?",
  "How can I apply for scholarships?",
  "Tell me about exams for CSE department",
  "How can I connect with the college?",
  "I want to publish a research paper with a professor",
];

function id() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function ChatClient({ initialMode }: { initialMode: "live" | "demo" }) {
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [lastMode, setLastMode] = useState<"live" | "demo">(initialMode);
  const messages = useChatStore((s) => s.messages);
  const appendMessage = useChatStore((s) => s.appendMessage);
  const clearChat = useChatStore((s) => s.clearChat);
  const userRole = useChatStore((s) => s.userRole);
  const setUserRole = useChatStore((s) => s.setUserRole);
  const expectingExamFollowUp = useChatStore((s) => s.expectingExamFollowUp);
  const setExpectingExamFollowUp = useChatStore((s) => s.setExpectingExamFollowUp);
  const preferredLanguage = useChatStore((s) => s.preferredLanguage);
  const setPreferredLanguage = useChatStore((s) => s.setPreferredLanguage);
  const recordQuery = useAnalyticsStore((s) => s.recordQuery);
  const recordFeedback = useAnalyticsStore((s) => s.recordFeedback);

  const { supported: sttOk, listening, listen } = useSpeechRecognition();
  const { supported: ttsOk, speak, stop } = useSpeechSynthesis();

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const userMsg: ChatMessage = {
        id: id(),
        role: "user",
        content: trimmed,
        createdAt: Date.now(),
      };
      const thread = [...messages, userMsg];
      appendMessage(userMsg);
      setInput("");
      setTyping(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: thread.map((m) => ({ role: m.role, content: m.content })),
            userRole,
            expectingExamFollowUp,
            preferredLanguage,
          }),
        });
        const data = (await res.json()) as ChatResponseBody & { responseTimeMs?: number };
        setLastMode(data.mode);
        if (data.needsExamFollowUp) setExpectingExamFollowUp(true);
        else setExpectingExamFollowUp(false);

        const assistant: ChatMessage = {
          id: id(),
          role: "assistant",
          content: data.content,
          createdAt: Date.now(),
          sources: data.sources,
          confidence: data.confidence,
          related: data.related,
          uiBlocks: data.uiBlocks,
          intent: data.intent,
        };
        appendMessage(assistant);

        const top = data.sources[0]?.section;
        recordQuery({
          intent: data.intent,
          responseTimeMs: data.responseTimeMs ?? 800,
          mode: data.mode,
          topSource: top,
        });
      } catch {
        appendMessage({
          id: id(),
          role: "assistant",
          content: "Network error. Please retry. The app stays in demo-safe mode.",
          createdAt: Date.now(),
          confidence: "low",
        });
      } finally {
        setTyping(false);
      }
    },
    [
      appendMessage,
      expectingExamFollowUp,
      messages,
      preferredLanguage,
      recordQuery,
      setExpectingExamFollowUp,
      userRole,
    ]
  );

  const badge = useMemo(() => {
    return lastMode === "live" ? "Live AI Mode" : "Demo Mode";
  }, [lastMode]);

  return (
    <div className="min-h-[calc(100vh-200px)] border-t border-[var(--color-border)] bg-[var(--color-bg)] py-8">
      <CenteredContainer>
        <div className="mb-6 flex flex-wrap items-center justify-center gap-3 font-body text-xs uppercase tracking-widest text-[var(--color-text-muted)]">
          <Badge variant="outline">{badge}</Badge>
          <label className="flex items-center gap-2">
            Role
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as UserRole)}
              className="border border-[var(--color-border)] bg-[var(--color-surface-input)] px-2 py-1 font-body text-[var(--color-text)]"
            >
              <option value="prospective">Prospective student</option>
              <option value="current">Current student</option>
              <option value="parent">Parent / Guardian</option>
              <option value="admin">Admin / Evaluator</option>
            </select>
          </label>
          <label className="flex items-center gap-2">
            Language
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              className="border border-[var(--color-border)] bg-[var(--color-surface-input)] px-2 py-1 font-body text-[var(--color-text)]"
            >
              <option value="en">English</option>
              <option value="hi">Hindi (stub)</option>
              <option value="ta">Tamil (stub)</option>
              <option value="te">Telugu (stub)</option>
            </select>
          </label>
        </div>

        <p className="mb-6 text-center font-body text-xs text-[var(--color-text-muted)]">
          AI responses are grounded in institutional sample data. Verify on official channels before acting.
        </p>

        <div className="space-y-4">
          <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-body text-xs uppercase tracking-widest text-[var(--color-text-muted)]">Quick topics</p>
              <p className="font-body text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-muted)]">Tap to prefill</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setInput(`Tell me about ${c.toLowerCase()}`)}
                  className="border border-[var(--color-border)] bg-[var(--color-surface-input)] px-3 py-2 font-body text-[10px] uppercase tracking-widest text-[var(--color-text)]"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
            <section className="space-y-4">
              <div className="max-h-[60vh] space-y-4 overflow-y-auto border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
                {messages.map((m) => (
                  <article
                    key={m.id}
                    className={
                      m.role === "user"
                        ? "ml-auto max-w-[90%] bg-[var(--color-surface-input)] p-3"
                        : "mr-auto max-w-[95%] bg-[var(--color-surface)] p-3"
                    }
                  >
                    <p className="whitespace-pre-wrap text-justify font-body text-sm leading-relaxed text-[var(--color-text)]">
                      {m.content}
                    </p>
                    {m.uiBlocks?.length ? <UiBlocksRenderer blocks={m.uiBlocks} /> : null}
                    {m.role === "assistant" && (
                      <div className="mt-3 space-y-2 border-t border-[var(--color-border)] pt-3 font-body text-xs text-[var(--color-text-muted)]">
                        <div className="flex flex-wrap gap-2">
                          <span>Confidence: {m.confidence ?? "—"}</span>
                          <span>{new Date(m.createdAt).toLocaleString()}</span>
                        </div>
                        {m.sources && m.sources.length > 0 && (
                          <div>
                            <p className="text-[var(--color-text)]">Sources used</p>
                            <ul className="list-disc pl-4">
                              {m.sources.map((s) => (
                                <li key={s.id}>
                                  {s.title}
                                  {s.section ? ` — ${s.section}` : ""}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {m.related && m.related.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {m.related.map((r) => (
                              <button
                                key={r}
                                type="button"
                                onClick={() => void send(r)}
                                className="border border-[var(--color-border)] bg-[var(--color-surface-input)] px-2 py-1 normal-case tracking-normal"
                              >
                                {r}
                              </button>
                            ))}
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => void navigator.clipboard.writeText(m.content)}
                            className="border border-[var(--color-border)] px-2 py-1 uppercase tracking-widest"
                          >
                            Copy
                          </button>
                          {ttsOk ? (
                            <>
                              <button
                                type="button"
                                onClick={() => speak(m.content)}
                                className="border border-[var(--color-border)] px-2 py-1 uppercase tracking-widest"
                              >
                                Read aloud
                              </button>
                              <button
                                type="button"
                                onClick={() => stop()}
                                className="border border-[var(--color-border)] px-2 py-1 uppercase tracking-widest"
                              >
                                Stop speech
                              </button>
                            </>
                          ) : null}
                          <button
                            type="button"
                            onClick={() =>
                              recordFeedback({
                                id: id(),
                                at: Date.now(),
                                sentiment: "up",
                                snippet: m.content.slice(0, 120),
                              })
                            }
                            className="border border-[var(--color-border)] px-2 py-1 uppercase tracking-widest"
                          >
                            Thumbs up
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              recordFeedback({
                                id: id(),
                                at: Date.now(),
                                sentiment: "down",
                                snippet: m.content.slice(0, 120),
                              })
                            }
                            className="border border-[var(--color-border)] px-2 py-1 uppercase tracking-widest"
                          >
                            Thumbs down
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                ))}
                {typing && <p className="font-body text-xs text-[var(--color-text-muted)]">Typing…</p>}
              </div>

              <form
                className="flex flex-col gap-2 sm:flex-row"
                onSubmit={(e) => {
                  e.preventDefault();
                  void send(input);
                }}
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your question"
                  className="min-h-12 flex-1 bg-[var(--color-surface-input)]"
                />
                <div className="flex flex-wrap gap-2">
                  <Button type="submit" variant="outline">
                    Send
                  </Button>
                  {sttOk ? (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={listening}
                      onClick={() =>
                        listen(
                          (t) => setInput(t),
                          () => {}
                        )
                      }
                    >
                      {listening ? "Listening…" : "Voice"}
                    </Button>
                  ) : (
                    <span className="self-center font-body text-xs text-[var(--color-text-faint)]">Voice unavailable</span>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      clearChat();
                      setExpectingExamFollowUp(false);
                    }}
                  >
                    Clear
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const blob = new Blob([messages.map((m) => `${m.role}: ${m.content}`).join("\n\n")], {
                        type: "text/plain",
                      });
                      const a = document.createElement("a");
                      a.href = URL.createObjectURL(blob);
                      a.download = "chat-export.txt";
                      a.click();
                      URL.revokeObjectURL(a.href);
                    }}
                  >
                    Export txt
                  </Button>
                </div>
              </form>
            </section>

            <aside className="space-y-4 font-body text-xs uppercase tracking-widest text-[var(--color-text-muted)]">
              <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                <p className="mb-2 text-[var(--color-text)]">Quick asks</p>
                <ul className="space-y-2">
                  {demoPrompts.map((p) => (
                    <li key={p}>
                      <button
                        type="button"
                        onClick={() => void send(p)}
                        className="w-full border border-[var(--color-border)] bg-[var(--color-surface-input)] p-2 text-left normal-case leading-snug tracking-normal text-[var(--color-text)]"
                      >
                        {p}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </CenteredContainer>
    </div>
  );
}
