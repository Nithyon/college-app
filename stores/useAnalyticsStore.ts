"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface FeedbackRow {
  id: string;
  at: number;
  sentiment: "up" | "down";
  snippet: string;
}

interface AnalyticsState {
  totalQueries: number;
  categoryCounts: Record<string, number>;
  dailyTrend: { day: string; count: number }[];
  responseTimes: number[];
  satisfaction: number;
  unanswered: { q: string; n: number }[];
  deptCounts: Record<string, number>;
  sourceUsage: Record<string, number>;
  feedback: FeedbackRow[];
  recordQuery: (opts: {
    intent: string;
    responseTimeMs: number;
    mode: string;
    topSource?: string;
    dept?: string;
  }) => void;
  recordFeedback: (row: FeedbackRow) => void;
}

function rollingDays(): { day: string; count: number }[] {
  const out: { day: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push({ day: d.toISOString().slice(0, 10), count: Math.floor(Math.random() * 4) });
  }
  return out;
}

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set, get) => ({
      totalQueries: 0,
      categoryCounts: {},
      dailyTrend: rollingDays(),
      responseTimes: [],
      satisfaction: 4.2,
      unanswered: [
        { q: "PhD stipend timeline (sample)", n: 3 },
        { q: "Dual degree credit mapping", n: 2 },
      ],
      deptCounts: {},
      sourceUsage: {},
      feedback: [],
      recordQuery: ({ intent, responseTimeMs, topSource, dept }) => {
        const s = get();
        const categoryCounts = { ...s.categoryCounts, [intent]: (s.categoryCounts[intent] ?? 0) + 1 };
        const responseTimes = [...s.responseTimes, responseTimeMs].slice(-50);
        const avg = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        const satisfaction = Math.min(5, 3.5 + (avg < 1200 ? 1 : 0.4));
        const today = new Date().toISOString().slice(0, 10);
        const dailyTrend = s.dailyTrend.map((d) =>
          d.day === today ? { ...d, count: d.count + 1 } : d
        );
        const sourceUsage = topSource
          ? { ...s.sourceUsage, [topSource]: (s.sourceUsage[topSource] ?? 0) + 1 }
          : s.sourceUsage;
        const deptCounts =
          dept && dept !== "UNKNOWN"
            ? { ...s.deptCounts, [dept]: (s.deptCounts[dept] ?? 0) + 1 }
            : s.deptCounts;
        set({
          totalQueries: s.totalQueries + 1,
          categoryCounts,
          responseTimes,
          satisfaction,
          dailyTrend,
          sourceUsage,
          deptCounts,
        });
      },
      recordFeedback: (row) =>
        set((s) => ({
          feedback: [row, ...s.feedback].slice(0, 200),
        })),
    }),
    { name: "college-ai-analytics" }
  )
);
