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
    "Welcome to the College AI Assistant. Answers are grounded in institutional sample data. Ask about admissions, fees, exams, placements, hostel, or research.",
  createdAt: Date.now(),
  confidence: "high",
  related: [
    "What is the admission process for B.Tech?",
    "What is the fee structure?",
    "How can I connect with the college?",
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
