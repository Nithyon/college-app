"use client";

import { useMemo, useState } from "react";
import { CenteredContainer } from "@/components/layout/CenteredContainer";
import { EmptyState } from "@/components/shared/EmptyState";
import { TextLink } from "@/components/shared/TextLink";
import { Input } from "@/components/ui/input";

const files = [
  "about.json",
  "departments.json",
  "courses.json",
  "admissions.json",
  "fees-current.json",
  "fees-history.json",
  "exams.json",
  "placements.json",
  "hostel.json",
  "transport.json",
  "library.json",
  "clubs-events.json",
  "scholarships.json",
  "rules.json",
  "contacts.json",
  "research-portal.json",
  "faculty.json",
  "faq.json",
  "announcements.json",
];

export function KnowledgeIndex() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return files;
    return files.filter((f) => f.toLowerCase().includes(t));
  }, [q]);

  return (
    <main className="border-t border-[var(--color-border)] bg-[var(--color-bg)] py-12">
      <CenteredContainer>
        <h1 className="text-center font-display text-3xl tracking-[0.04em] text-[var(--color-text)] [font-variant:small-caps]">
          Knowledge base index
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-justify font-body text-sm leading-relaxed text-[var(--color-text-muted)]">
          All entries are sample/demo JSON under <code className="text-[var(--color-text)]">/data</code>. Replace with
          your institution&apos;s verified content. Retrieval simulates RAG by keyword overlap over these documents.
        </p>
        <div className="mx-auto mt-8 max-w-md">
          <label htmlFor="kb-search" className="sr-only">
            Search files
          </label>
          <Input
            id="kb-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter by filename…"
            className="bg-[var(--color-surface-input)]"
          />
        </div>
        {filtered.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="No files match"
              description="Clear the filter or try another substring — nothing is wrong with the knowledge base."
            />
          </div>
        ) : (
          <ul className="mt-8 space-y-2 font-body text-sm text-[var(--color-text)]">
            {filtered.map((f) => (
              <li key={f} className="border-b border-[var(--color-border)] py-2">
                {f}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-8 text-center font-body text-xs text-[var(--color-text-muted)]">
          <TextLink href="/chat">Open assistant</TextLink>
        </p>
      </CenteredContainer>
    </main>
  );
}
