import type { Confidence, UiBlock } from "@/types/chat";
import type { Intent } from "@/types/intents";
import { kb } from "@/lib/data/loaders";
import { inferDepartment } from "./intentDetector";

function includesAny(text: string, words: string[]): boolean {
  return words.some((w) => text.includes(w));
}

function hasExamSpecificContext(text: string): boolean {
  return (
    Boolean(inferDepartment(text)) ||
    includesAny(text, ["internal", "semester", "supplementary", "entrance", "midterm", "end term", "end-term"])
  );
}

function withFriendlyNextStep(content: string, nextStep?: string): string {
  if (!nextStep) return content;
  return `${content}\n\n${nextStep}`;
}

function answerFromFaqOrAnnouncements(userMessage: string): { content: string; confidence: Confidence } | null {
  const t = userMessage.toLowerCase();
  const words = t
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const faq = kb.faq as { items?: { q: string; a: string }[] };
  const bestFaq = (faq.items ?? [])
    .map((item) => {
      const hay = `${item.q} ${item.a}`.toLowerCase();
      const score = words.reduce((acc, w) => (hay.includes(w) ? acc + 1 : acc), 0);
      return { item, score };
    })
    .sort((a, b) => b.score - a.score)[0];

  if (bestFaq && bestFaq.score >= 2) {
    return {
      content: withFriendlyNextStep(
        `I found a closely related FAQ answer:\n${bestFaq.item.a}`,
        "If you want, I can also point you to the most relevant official page for this."
      ),
      confidence: "medium",
    };
  }

  const announcements = kb.announcements as { items?: { date: string; title: string; body: string }[] };
  const topNotice = (announcements.items ?? []).find((n) =>
    words.some((w) => `${n.title} ${n.body}`.toLowerCase().includes(w))
  );
  if (topNotice) {
    return {
      content: withFriendlyNextStep(
        `I found a related notice (${topNotice.date}): ${topNotice.title}. ${topNotice.body}`,
        "If you want, I can help you with the exact next action based on this notice."
      ),
      confidence: "low",
    };
  }

  return null;
}

function answerGeneralTopic(userMessage: string): { content: string; confidence: Confidence } | null {
  const t = userMessage.toLowerCase();
  if (includesAny(t, ["dream", "dream college", "encouragement", "inspire", "motivation", "believe", "achieve", "goal", "aspiration", "passion"])) {
    return {
      content: withFriendlyNextStep(
        "That's wonderful! SRM Institute of Science and Technology is an excellent choice. With dedicated faculty, state-of-the-art facilities, strong industry connections, and a vibrant campus community, you'll find all the support you need to pursue your dreams here.\n\nFocus on your studies, engage with extracurriculars, build meaningful connections, and don't hesitate to reach out to faculty and mentors. Your success starts with your determination, and our institution provides the perfect environment to flourish.\n\nYou've got this! 🎓",
        "Want to explore our courses, placement statistics, or campus facilities to see how they align with your goals?"
      ),
      confidence: "high",
    };
  }
  if (includesAny(t, ["admission", "admissions", "apply", "application", "srmjeee", "eligibility"])) {
    const admissions = kb.admissions as {
      btech?: string;
      steps?: string[];
      importantDates?: string;
    };
    const steps = (admissions.steps ?? []).map((s, i) => `${i + 1}. ${s}`).join("\n");
    return {
      content: withFriendlyNextStep(
        [
        admissions.btech ?? "Use the official program admission page for process and eligibility.",
        steps ? `\nAdmission steps:\n${steps}` : "",
        admissions.importantDates ? `\nImportant dates: ${admissions.importantDates}` : "",
      ]
        .filter(Boolean)
        .join("\n\n"),
        "If you share your program and campus, I can tailor the steps for you."
      ),
      confidence: "high",
    };
  }

  if (includesAny(t, ["placement", "placements", "recruiter", "package", "career"])) {
    const p = kb.placements as {
      lastYear?: string;
      avgPackage?: string;
      maxPackage?: string;
      placementRate?: string;
      recruiters?: string[];
    };
    return {
      content: withFriendlyNextStep(
        [
        "Placement highlights are published on official SRMIST career and placement channels.",
        `Last year: ${p.lastYear ?? "Refer to official placement reports"}`,
        `Average package: ${p.avgPackage ?? "Refer to official placement reports"}`,
        `Maximum package: ${p.maxPackage ?? "Refer to official placement reports"}`,
        `Placement rate: ${p.placementRate ?? "Refer to official placement reports"}`,
        p.recruiters?.length ? `References: ${p.recruiters.join("; ")}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
        "If you want, I can also summarize this for a specific branch."
      ),
      confidence: "medium",
    };
  }

  if (includesAny(t, ["academic", "academics", "course", "courses", "program", "programme", "curriculum", "syllabus"])) {
    const c = kb.courses as {
      courses?: { name: string; duration: string; eligibility: string; streams: string[] }[];
    };
    const d = kb.departments as {
      departments?: { code: string; name: string; focus: string }[];
    };

    const courseLines = (c.courses ?? []).map(
      (x) => `${x.name} (${x.duration}) — Eligibility: ${x.eligibility}. Streams: ${x.streams.join(", ")}`
    );
    const deptLines = (d.departments ?? []).map((x) => `${x.code}: ${x.name}`);

    return {
      content: withFriendlyNextStep(
        [
        "Here is a quick academic overview:",
        courseLines.length ? courseLines.join("\n") : "Program details are available on the official admissions pages.",
        deptLines.length ? `\nSchools / departments: ${deptLines.join("; ")}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
        "Tell me your intended course, and I can suggest the best starting page."
      ),
      confidence: "medium",
    };
  }

  if (includesAny(t, ["campus facilities", "facility", "facilities", "infrastructure", "campus", "amenities"])) {
    const lib = kb.library as { weekday?: string; weekend?: string; resources?: string[] };
    const hos = kb.hostel as { facilities?: string[]; feePerYear?: string };
    const tr = kb.transport as { routes?: string[]; timings?: string };
    return {
      content: withFriendlyNextStep(
        [
        "Here is a quick campus facilities snapshot:",
        lib.weekday || lib.weekend
          ? `Library: Weekdays ${lib.weekday ?? "—"}; Weekends ${lib.weekend ?? "—"}`
          : "",
        lib.resources?.length ? `Library resources: ${lib.resources.join(", ")}` : "",
        hos.facilities?.length ? `Hostel facilities: ${hos.facilities.join(", ")}` : "",
        hos.feePerYear ? `Hostel fee reference: ${hos.feePerYear}` : "",
        tr.routes?.length ? `Transport routes: ${tr.routes.join("; ")}` : "",
        tr.timings ? `Transport timings: ${tr.timings}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
        "If you are moving to campus, I can also help with a checklist."
      ),
      confidence: "medium",
    };
  }

  if (includesAny(t, ["event", "events", "club", "clubs", "society", "societies", "co-curricular"])) {
    const ce = kb.clubsEvents as { clubs?: string[]; events?: string[]; join?: string };
    return {
      content: withFriendlyNextStep(
        [
        ce.clubs?.length ? `Clubs: ${ce.clubs.join(", ")}` : "",
        ce.events?.length ? `Events: ${ce.events.join("; ")}` : "",
        ce.join ? `How to join: ${ce.join}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
        "If you want, I can suggest clubs based on your interests."
      ),
      confidence: "medium",
    };
  }

  if (includesAny(t, ["library", "weekend", "weekday", "timing", "timings", "hours", "opac"])) {
    const l = kb.library as {
      weekday?: string;
      weekend?: string;
      rules?: string;
      resources?: string[];
    };
    return {
      content: withFriendlyNextStep(
        [
        "Here are the library timings:",
        `Weekdays: ${l.weekday ?? "See official notice"}`,
        `Weekends: ${l.weekend ?? "See official notice"}`,
        l.rules ? `Rules: ${l.rules}` : "",
        l.resources?.length ? `Resources: ${l.resources.join("; ")}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
        "If you want, I can also share the best time to avoid rush hours."
      ),
      confidence: "high",
    };
  }

  if (includesAny(t, ["hostel", "accommodation", "mess", "room"])) {
    const h = kb.hostel as {
      feePerYear?: string;
      types?: string[];
      facilities?: string[];
      rules?: string;
    };
    return {
      content: withFriendlyNextStep(
        [
        `Hostel fee reference: ${h.feePerYear ?? "Check official hostel office notice"}`,
        h.types?.length ? `Room types: ${h.types.join(", ")}` : "",
        h.facilities?.length ? `Facilities: ${h.facilities.join(", ")}` : "",
        h.rules ? `Rules: ${h.rules}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
        "If you share your budget, I can help you compare hostel options."
      ),
      confidence: "medium",
    };
  }

  if (includesAny(t, ["transport", "bus", "route", "pickup", "drop"])) {
    const tr = kb.transport as {
      note?: string;
      coverage?: string;
      contact?: string;
    };
    return {
      content: withFriendlyNextStep(
        [
        tr.note ?? "Transport details are route-based and updated by the transport office.",
        tr.coverage ? `Coverage: ${tr.coverage}` : "",
        tr.contact ? `Contact: ${tr.contact}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
        "If you share your area, I can suggest the most likely route."
      ).trim(),
      confidence: "medium",
    };
  }

  if (includesAny(t, ["rule", "rules", "policy", "policies", "discipline"])) {
    const r = kb.rules as { highlights?: string[]; summary?: string };
    return {
      content: withFriendlyNextStep(
        [
        r.summary ?? "Please follow institutional rules and policies from official student handbooks.",
        r.highlights?.length ? `Highlights: ${r.highlights.join("; ")}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
        "If you want, I can break this down into a simple do/don't list."
      ),
      confidence: "medium",
    };
  }

  return null;
}

export function mockAnswer(opts: {
  intent: Intent;
  userMessage: string;
  expectingExamFollowUp: boolean;
}): { content: string; uiBlocks?: UiBlock[]; confidence: Confidence; needsExamFollowUp?: boolean } {
  const { intent, userMessage, expectingExamFollowUp } = opts;

  if (intent === "exam_intent" && !expectingExamFollowUp && !hasExamSpecificContext(userMessage.toLowerCase())) {
    return {
      content:
        "Happy to help. Which department should I check, and is this for internal, semester, supplementary, or entrance exams?",
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
      content: withFriendlyNextStep(
        `${detail}\n\nFor the latest official exam updates, please use: ${portal}`,
        "If you want, I can also explain what to do if you miss an exam deadline."
      ),
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
    const note = `Official fee pages are program-specific on SRMIST. Scholarships listed on the official engineering scholarships page: ${schol
      .map((s) => s.name)
      .join(", ")}. ${(kb.scholarships as { process?: string }).process ?? ""}`;
    return {
      content:
        "Sure. Fee details are published program-wise and category-wise. Please use the official links below for the latest and most accurate structure.",
      uiBlocks: [
        {
          type: "fees",
          rows,
          history,
          scholarshipNote: note,
          sourceLinks: [
            { label: "Engineering admissions", href: "https://www.srmist.edu.in/admission-india/engineering/" },
            { label: "Management admissions", href: "https://www.srmist.edu.in/admission-india/management/" },
            { label: "Scholarships", href: "https://www.srmist.edu.in/admission-india/engineering/scholarships/" },
          ],
        },
      ],
      confidence: "high",
    };
  }

  if (intent === "contact_intent") {
    const c = kb.contacts as Record<string, string>;
    return {
      content: "Absolutely. Here are the official ways to connect with the college.",
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
      content: withFriendlyNextStep(
        rp.summary,
        "If you share your research area, I can suggest a better starting path."
      ),
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
    const topic = answerGeneralTopic(userMessage);
    if (topic) {
      return {
        content: topic.content,
        confidence: topic.confidence,
      };
    }

    const kbFallback = answerFromFaqOrAnnouncements(userMessage);
    if (kbFallback) {
      return kbFallback;
    }

    return {
      content:
        "I could not find a reliable exact match yet, but I can still help. Ask me about admissions, fees, exams, placements, hostel, library, scholarships, rules, research, or contact details.",
      confidence: "low",
    };
  }

  // general
  const topic = answerGeneralTopic(userMessage);
  if (topic) {
    return {
      content: topic.content,
      confidence: topic.confidence,
    };
  }

  const kbFallback = answerFromFaqOrAnnouncements(userMessage);
  if (kbFallback) {
    return kbFallback;
  }

  const about = kb.about as { overview?: string };
  return {
    content:
      about.overview ??
      "I can help with programs, admissions, campus services, and policies. Tell me what you need, and I will guide you step by step.",
    confidence: "medium",
  };
}
