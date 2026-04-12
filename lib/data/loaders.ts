import about from "@/data/about.json";
import departments from "@/data/departments.json";
import courses from "@/data/courses.json";
import admissions from "@/data/admissions.json";
import feesCurrent from "@/data/fees-current.json";
import feesHistory from "@/data/fees-history.json";
import exams from "@/data/exams.json";
import placements from "@/data/placements.json";
import hostel from "@/data/hostel.json";
import transport from "@/data/transport.json";
import library from "@/data/library.json";
import clubsEvents from "@/data/clubs-events.json";
import scholarships from "@/data/scholarships.json";
import rules from "@/data/rules.json";
import contacts from "@/data/contacts.json";
import researchPortal from "@/data/research-portal.json";
import faculty from "@/data/faculty.json";
import faq from "@/data/faq.json";
import announcements from "@/data/announcements.json";

export const kb = {
  about,
  departments,
  courses,
  admissions,
  feesCurrent,
  feesHistory,
  exams,
  placements,
  hostel,
  transport,
  library,
  clubsEvents,
  scholarships,
  rules,
  contacts,
  researchPortal,
  faculty,
  faq,
  announcements,
} as const;

export type KbKey = keyof typeof kb;
