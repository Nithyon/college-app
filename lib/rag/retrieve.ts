import { kb } from "@/lib/data/loaders";
import type { Intent } from "@/types/intents";
import type { RetrievalResult } from "./types";

const STOP = new Set([
  "the",
  "and",
  "for",
  "with",
  "about",
  "from",
  "this",
  "that",
  "what",
  "when",
  "how",
  "are",
  "you",
  "can",
  "fee",
  "fees",
]);

function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP.has(t));
}

function scoreDoc(haystack: string, toks: string[]): number {
  const h = haystack.toLowerCase();
  let s = 0;
  for (const t of toks) {
    if (h.includes(t)) s += 1;
  }
  return s;
}

/** Lightweight keyword retrieval; structured for future embeddings. */
export function retrieveForIntent(intent: Intent, query: string): RetrievalResult {
  const toks = tokens(query);
  const packs: { key: string; title: string; text: string }[] = [
    { key: "about", title: "About", text: JSON.stringify(kb.about) },
    { key: "departments", title: "Departments", text: JSON.stringify(kb.departments) },
    { key: "courses", title: "Courses", text: JSON.stringify(kb.courses) },
    { key: "admissions", title: "Admissions", text: JSON.stringify(kb.admissions) },
    { key: "fees", title: "Fees (current)", text: JSON.stringify(kb.feesCurrent) },
    { key: "feesHistory", title: "Fees (history)", text: JSON.stringify(kb.feesHistory) },
    { key: "exams", title: "Examinations", text: JSON.stringify(kb.exams) },
    { key: "placements", title: "Placements", text: JSON.stringify(kb.placements) },
    { key: "hostel", title: "Hostel", text: JSON.stringify(kb.hostel) },
    { key: "transport", title: "Transport", text: JSON.stringify(kb.transport) },
    { key: "library", title: "Library", text: JSON.stringify(kb.library) },
    { key: "clubs", title: "Clubs & events", text: JSON.stringify(kb.clubsEvents) },
    { key: "scholarships", title: "Scholarships", text: JSON.stringify(kb.scholarships) },
    { key: "rules", title: "Rules & policies", text: JSON.stringify(kb.rules) },
    { key: "contacts", title: "Contacts", text: JSON.stringify(kb.contacts) },
    { key: "research", title: "Research portal", text: JSON.stringify(kb.researchPortal) },
    { key: "faculty", title: "Faculty", text: JSON.stringify(kb.faculty) },
    { key: "faq", title: "FAQ", text: JSON.stringify(kb.faq) },
    { key: "announcements", title: "Announcements", text: JSON.stringify(kb.announcements) },
  ];

  const intentBoost: Record<string, string[]> = {
    exam_intent: ["exams", "departments", "rules"],
    fee_intent: ["fees", "feesHistory", "scholarships"],
    contact_intent: ["contacts"],
    research_intent: ["research", "faculty", "departments"],
    general_intent: [],
    unknown_intent: [],
  };

  const boost = new Set(intentBoost[intent] ?? []);

  const scored = packs.map((p) => {
    let sc = scoreDoc(p.text, toks);
    if (boost.has(p.key)) sc += 3;
    return { ...p, sc };
  });

  scored.sort((a, b) => b.sc - a.sc);
  const top = scored.slice(0, 5).filter((s) => s.sc > 0 || boost.has(s.key));

  const chosen = top.length ? top : scored.slice(0, 3);

  const context = chosen.map((c) => `### ${c.title}\n${c.text}`).join("\n\n");
  const sources = chosen.map((c, i) => ({
    id: `${c.key}-${i}`,
    title: c.title,
    section: c.key,
  }));

  return { context, sources };
}
