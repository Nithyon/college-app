"use client";

import { create } from "zustand";
import type { ChatMessage, UserRole } from "@/types/chat";

interface ChatState {
  messages: ChatMessage[];
  userRole: UserRole;
  expectingExamFollowUp: boolean;
  preferredLanguage: string;
  appendMessage: (m: ChatMessage) => void;
  setMessages: (m: ChatMessage[]) => void;
  clearChat: () => void;
  setUserRole: (r: UserRole) => void;
  setExpectingExamFollowUp: (v: boolean) => void;
  setPreferredLanguage: (l: string) => void;
}

const welcome: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Welcome to the SRMIST AI Assistant. Answers are grounded in official SRM links, admissions pages, public disclosure documents, and program-specific references.",
  createdAt: Date.now(),
  confidence: "high",
  related: [
    "What is the SRMJEEE (UG) admission process?",
    "Where do I check official fee details?",
    "How do I contact SRMIST?",
  ],
};

export const useChatStore = create<ChatState>((set) => ({
  messages: [welcome],
  userRole: "prospective",
  expectingExamFollowUp: false,
  preferredLanguage: "en",
  appendMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
  setMessages: (m) => set({ messages: m }),
  clearChat: () => set({ messages: [welcome], expectingExamFollowUp: false }),
  setUserRole: (r) => set({ userRole: r }),
  setExpectingExamFollowUp: (v) => set({ expectingExamFollowUp: v }),
  setPreferredLanguage: (l) => set({ preferredLanguage: l }),
}));
