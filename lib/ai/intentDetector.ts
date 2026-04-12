import type { Intent } from "@/types/intents";

const examRe =
  /\b(exam|exams|semester|internal|supplementary|midterm|end[- ]?term|entrance test|schedule|timetable)\b/i;
const feeRe = /\b(fee|fees|tuition|payment|installment|scholarship|waiver)\b/i;
const contactRe =
  /\b(contact|email|phone|address|reach|call|instagram|linkedin|website|connect with)\b/i;
const researchRe =
  /\b(research|professor|faculty|paper|publish|publication|collaboration|journal|thesis|phd)\b/i;

export function detectIntent(text: string): Intent {
  const t = text.trim();
  if (feeRe.test(t)) return "fee_intent";
  if (contactRe.test(t)) return "contact_intent";
  if (researchRe.test(t)) return "research_intent";
  if (examRe.test(t)) return "exam_intent";
  if (t.length < 4) return "unknown_intent";
  return "general_intent";
}

/** Map free-text to a department code for exam answers (sample). */
export function inferDepartment(reply: string): string | null {
  const u = reply.toUpperCase();
  const codes = ["CSE", "ECE", "ME", "CE", "MBA"];
  for (const c of codes) {
    if (u.includes(c)) return c;
  }
  if (/computer|software|cs\b/i.test(reply)) return "CSE";
  if (/electronic|communication/i.test(reply)) return "ECE";
  if (/mechanical/i.test(reply)) return "ME";
  if (/civil/i.test(reply)) return "CE";
  if (/management|mba/i.test(reply)) return "MBA";
  return null;
}
