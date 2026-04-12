import dynamic from "next/dynamic";

const AdminDashboard = dynamic(
  () => import("@/components/dashboard/AdminDashboard").then((m) => ({ default: m.AdminDashboard })),
  { ssr: false, loading: () => <p className="p-8 text-center font-body text-xs text-[var(--color-text-muted)]">Loading…</p> }
);

export default function AdminPage() {
  return <AdminDashboard />;
}
