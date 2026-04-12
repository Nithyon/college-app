/** Embedding-ready document shape for future vector ingestion */
export interface KbDocument {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  sourceFile: string;
  embeddingReady?: boolean;
}
