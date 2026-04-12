"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAnalyticsStore } from "@/stores/useAnalyticsStore";
import { CenteredContainer } from "@/components/layout/CenteredContainer";

const gray = {
  axis: "#888888",
  grid: "#DDDDDD",
  bar: "#111111",
  line: "#111111",
};

export function AdminDashboard() {
  const totalQueries = useAnalyticsStore((s) => s.totalQueries);
  const categoryCounts = useAnalyticsStore((s) => s.categoryCounts);
  const dailyTrend = useAnalyticsStore((s) => s.dailyTrend);
  const satisfaction = useAnalyticsStore((s) => s.satisfaction);
  const unanswered = useAnalyticsStore((s) => s.unanswered);
  const deptCounts = useAnalyticsStore((s) => s.deptCounts);
  const sourceUsage = useAnalyticsStore((s) => s.sourceUsage);
  const feedback = useAnalyticsStore((s) => s.feedback);
  const responseTimes = useAnalyticsStore((s) => s.responseTimes);

  const barData = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));
  const avgRt =
    responseTimes.length > 0
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 0;

  const deptData = Object.entries(deptCounts).map(([name, value]) => ({ name, value }));
  const srcData = Object.entries(sourceUsage).map(([name, value]) => ({ name, value }));

  return (
    <main className="border-t border-[var(--color-border)] bg-[var(--color-bg)] py-12">
      <CenteredContainer>
        <h1 className="text-center font-display text-3xl tracking-[0.04em] text-[var(--color-text)] [font-variant:small-caps]">
          Admin analytics
        </h1>
        <p className="mt-4 text-center font-body text-xs text-[var(--color-text-muted)]">
          Demo metrics augmented by local session activity. Resets if browser storage clears.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {[
            { label: "Total queries", value: String(totalQueries) },
            { label: "Avg response (ms)", value: String(avgRt) },
            { label: "Satisfaction (mock)", value: satisfaction.toFixed(1) },
          ].map((m) => (
            <div key={m.label} className="bg-[var(--color-surface)] p-4 text-center font-body text-xs uppercase tracking-widest">
              <p className="text-[var(--color-text-muted)]">{m.label}</p>
              <p className="mt-2 text-2xl text-[var(--color-text)]">{m.value}</p>
            </div>
          ))}
        </div>

        <section className="mt-10 bg-[var(--color-surface)] p-4">
          <h2 className="font-body text-xs uppercase tracking-widest text-[var(--color-text)]">
            Categories (bar)
          </h2>
          <div className="mt-4 h-64 min-h-[256px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData.length ? barData : [{ name: "none", value: 0 }]}>
                <CartesianGrid stroke={gray.grid} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: gray.axis, fontSize: 10 }} />
                <YAxis tick={{ fill: gray.axis, fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    background: "#F5F5F0",
                    border: "1px solid #DDDDDD",
                    borderRadius: 2,
                    fontFamily: "var(--font-body)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" fill={gray.bar} radius={[0, 0, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="mt-8 bg-[var(--color-surface)] p-4">
          <h2 className="font-body text-xs uppercase tracking-widest text-[var(--color-text)]">
            Query trend (line)
          </h2>
          <div className="mt-4 h-64 min-h-[256px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyTrend}>
                <CartesianGrid stroke={gray.grid} />
                <XAxis dataKey="day" tick={{ fill: gray.axis, fontSize: 9 }} />
                <YAxis tick={{ fill: gray.axis, fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    background: "#F5F5F0",
                    border: "1px solid #DDDDDD",
                    borderRadius: 2,
                    fontFamily: "var(--font-body)",
                    fontSize: 12,
                  }}
                />
                <Line type="monotone" dataKey="count" stroke={gray.line} dot={false} strokeWidth={1} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="bg-[var(--color-surface)] p-4">
            <h2 className="font-body text-xs uppercase tracking-widest text-[var(--color-text)]">
              Departments (when tagged)
            </h2>
            <div className="mt-4 h-48 min-h-[192px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData.length ? deptData : [{ name: "n/a", value: 0 }]}>
                  <CartesianGrid stroke={gray.grid} vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: gray.axis, fontSize: 10 }} />
                  <YAxis tick={{ fill: gray.axis, fontSize: 10 }} />
                  <Bar dataKey="value" fill={gray.bar} radius={[0, 0, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
          <section className="bg-[var(--color-surface)] p-4">
            <h2 className="font-body text-xs uppercase tracking-widest text-[var(--color-text)]">
              Retrieval sources
            </h2>
            <div className="mt-4 h-48 min-h-[192px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={srcData.length ? srcData : [{ name: "n/a", value: 0 }]}>
                  <CartesianGrid stroke={gray.grid} vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: gray.axis, fontSize: 9 }} />
                  <YAxis tick={{ fill: gray.axis, fontSize: 10 }} />
                  <Bar dataKey="value" fill={gray.bar} radius={[0, 0, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        <section className="mt-8 bg-[var(--color-surface)] p-4">
          <h2 className="font-body text-xs uppercase tracking-widest text-[var(--color-text)]">
            Top unanswered (mock + local)
          </h2>
          <ul className="mt-3 space-y-2 font-body text-xs text-[var(--color-text)]">
            {unanswered.map((u) => (
              <li key={u.q} className="border-b border-[var(--color-border)] py-2">
                {u.q} — {u.n}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8 bg-[var(--color-surface)] p-4">
          <h2 className="font-body text-xs uppercase tracking-widest text-[var(--color-text)]">
            Feedback log
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse border border-[var(--color-border)] text-left font-body text-xs">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="border-r border-[var(--color-border)] p-2">Time</th>
                  <th className="border-r border-[var(--color-border)] p-2">Sentiment</th>
                  <th className="p-2">Snippet</th>
                </tr>
              </thead>
              <tbody>
                {feedback.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-3 text-[var(--color-text-muted)]">
                      No feedback yet — use thumbs in chat.
                    </td>
                  </tr>
                ) : (
                  feedback.slice(0, 30).map((f) => (
                    <tr key={f.id} className="border-b border-[var(--color-border)]">
                      <td className="border-r border-[var(--color-border)] p-2">
                        {new Date(f.at).toLocaleString()}
                      </td>
                      <td className="border-r border-[var(--color-border)] p-2">{f.sentiment}</td>
                      <td className="p-2">{f.snippet}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </CenteredContainer>
    </main>
  );
}
