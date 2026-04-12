import type { Intent } from "./intents";

export type { Intent };

export type UserRole = "prospective" | "current" | "parent" | "admin";

export type Confidence = "high" | "medium" | "low";

export interface SourceRef {
  id: string;
  title: string;
  section?: string;
}

export interface FeeRow {
  course: string;
  year: string;
  tuition: string;
  hostel?: string;
  total: string;
}

export interface FeeHistoryRow {
  academicYear: string;
  btech: string;
  mtech: string;
  mba: string;
}

export interface ContactData {
  officialEmail: string;
  admissionsEmail: string;
  supportEmail: string;
  phone: string;
  address: string;
  instagram: string;
  linkedin: string;
  website: string;
}

export type UiBlock =
  | { type: "fees"; rows: FeeRow[]; history: FeeHistoryRow[]; scholarshipNote: string }
  | { type: "contact"; data: ContactData }
  | { type: "research"; portalUrl: string; summary: string; categories: string[] }
  | { type: "examCta"; url: string; label: string };

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
  sources?: SourceRef[];
  confidence?: Confidence;
  related?: string[];
  uiBlocks?: UiBlock[];
  intent?: Intent;
}

export interface ChatRequestBody {
  messages: { role: "user" | "assistant"; content: string }[];
  userRole: UserRole;
  expectingExamFollowUp?: boolean;
  preferredLanguage?: string;
}

export interface ChatResponseBody {
  content: string;
  sources: SourceRef[];
  confidence: Confidence;
  related: string[];
  uiBlocks?: UiBlock[];
  intent: Intent;
  mode: "live" | "demo";
  provider: string;
  needsExamFollowUp?: boolean;
  error?: string;
  responseTimeMs?: number;
}
