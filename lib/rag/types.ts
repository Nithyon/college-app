import type { SourceRef } from "@/types/chat";

export interface RetrievalResult {
  context: string;
  sources: SourceRef[];
}
