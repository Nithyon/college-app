import type { Confidence, UiBlock } from "@/types/chat";
import type { Intent } from "@/types/intents";
import { kb } from "@/lib/data/loaders";
import { inferDepartment } from "./intentDetector";

export function mockAnswer(opts: {
  intent: Intent;
  userMessage: string;
  expectingExamFollowUp: boolean;
}): { content: string; uiBlocks?: UiBlock[]; confidence: Confidence; needsExamFollowUp?: boolean } {
  const { intent, userMessage, expectingExamFollowUp } = opts;

  if (intent === "exam_intent" && !expectingExamFollowUp) {
    return {
      content:
        "Which department are you asking about? And is this for internal exams, semester exams, supplementary exams, or entrance exams?",
      confidence: "high",
      needsExamFollowUp: true,
    };
  }

  if (intent === "exam_intent" && expectingExamFollowUp) {
    const dept = inferDepartment(userMessage);
    const by = kb.exams.byDepartment as Record<string, string>;
    const detail = dept && by[dept] ? by[dept] : kb.exams.default;
    const portal = kb.exams.officialPortalUrl as string;
    return {
      content: `${detail}\n\nFor the latest official exam updates, visit ${portal}`,
      uiBlocks: [{ type: "examCta", url: portal, label: "Visit Official Exam Page →" }],
      confidence: dept ? "high" : "medium",
    };
  }

  if (intent === "fee_intent") {
    const rows = kb.feesCurrent.rows as {
      course: string;
      year: string;
      tuition: string;
      hostel?: string;
      total: string;
    }[];
    const history = kb.feesHistory.rows as {
      academicYear: string;
      btech: string;
      mtech: string;
      mba: string;
    }[];
    const schol = kb.scholarships.types as { name: string; eligibility: string; benefit: string }[];
    const note = `${(kb.feesHistory as { note?: string }).note ?? ""} Scholarships: ${schol.map((s) => s.name).join(", ")}. ${(kb.scholarships as { process?: string }).process ?? ""}`;
    return {
      content:
        "Below is the current fee structure (sample data). A year-wise comparison and scholarship note are included.",
      uiBlocks: [{ type: "fees", rows, history, scholarshipNote: note }],
      confidence: "high",
    };
  }

  if (intent === "contact_intent") {
    const c = kb.contacts as Record<string, string>;
    return {
      content: "Here are the official channels (sample/demo contacts).",
      uiBlocks: [
        {
          type: "contact",
          data: {
            officialEmail: c.officialEmail,
            admissionsEmail: c.admissionsEmail,
            supportEmail: c.supportEmail,
            phone: c.phone,
            address: c.address,
            instagram: c.instagram,
            linkedin: c.linkedin,
            website: c.website,
          },
        },
      ],
      confidence: "high",
    };
  }

  if (intent === "research_intent") {
    const rp = kb.researchPortal as { url: string; summary: string; categories: string[] };
    return {
      content: rp.summary,
      uiBlocks: [
        {
          type: "research",
          portalUrl: rp.url,
          summary: rp.summary,
          categories: rp.categories,
        },
      ],
      confidence: "high",
    };
  }

  if (intent === "unknown_intent") {
    return {
      content:
        "I couldn't find a specific answer. Here are some things I can help with: admissions, fees, exams, placements, hostel, library, scholarships, rules, research, and contact details.",
      confidence: "low",
    };
  }

  // general
  const about = kb.about as { overview?: string };
  return {
    content:
      about.overview ??
      "I can help with programs, admissions, campus services, and policies using the sample knowledge base.",
    confidence: "medium",
  };
}
