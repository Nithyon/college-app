import Link from "next/link";
import { CenteredContainer } from "@/components/layout/CenteredContainer";
import { DemoContactForm } from "@/components/shared/DemoContactForm";

export default function Home() {
  return (
    <main className="bg-[var(--color-bg)] pb-16 pt-12">
      <CenteredContainer>
        <h1 className="text-center font-display text-4xl leading-tight text-[var(--color-text)] [font-variant:small-caps] [letter-spacing:0.04em] md:text-5xl">
          SRMIST AI Assistant
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-justify font-body text-sm leading-relaxed tracking-wide text-[var(--color-text-muted)]">
          Ask about SRMJEEE admissions, official fee pages, scholarships, placements, hostel, transport, library,
          rules, research, and contact options. Responses combine official SRM links with a lightweight retrieval
          layer and an optional Groq or OpenRouter model.
        </p>

        <div className="mt-12 grid gap-6 text-center sm:grid-cols-3">
          {[
            { k: "Modes", v: "Live AI or Official references" },
            { k: "Voice", v: "Browser STT / TTS" },
            { k: "Audience", v: "Students · Parents · Staff" },
          ].map((c) => (
            <div key={c.k} className="bg-[var(--color-surface)] px-4 py-6">
              <p className="font-body text-xs uppercase tracking-[0.2em] text-[var(--color-text-muted)]">{c.k}</p>
              <p className="mt-3 font-body text-sm text-[var(--color-text)]">{c.v}</p>
            </div>
          ))}
        </div>

        <section className="mt-12 bg-[var(--color-surface)] p-8">
          <h2 className="text-center font-display text-2xl tracking-[0.04em] text-[var(--color-text)] [font-variant:small-caps]">
            Capabilities
          </h2>
          <ul className="mx-auto mt-6 max-w-2xl list-disc space-y-2 pl-5 font-body text-sm text-[var(--color-text)]">
            <li>Intent-aware flows for exams (clarifying question), fees (official reference cards), contact card, research portal.</li>
            <li>Source citations, confidence label, related prompts, copy, feedback capture, export.</li>
            <li>Admin dashboard with monochrome charts and local analytics persistence.</li>
          </ul>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/chat"
              className="min-h-[48px] border border-[var(--color-border)] bg-[var(--color-bg)] px-6 py-3 font-body text-xs uppercase tracking-widest text-[var(--color-text)]"
            >
              Try assistant
            </Link>
            <Link
              href="/knowledge"
              className="min-h-[48px] border border-[var(--color-border)] px-6 py-3 font-body text-xs uppercase tracking-widest text-[var(--color-text)]"
            >
              Knowledge base
            </Link>
            <Link
              href="/admin"
              className="min-h-[48px] border border-[var(--color-border)] px-6 py-3 font-body text-xs uppercase tracking-widest text-[var(--color-text)]"
            >
              Admin view
            </Link>
          </div>
        </section>

        <DemoContactForm />
      </CenteredContainer>
    </main>
  );
}
