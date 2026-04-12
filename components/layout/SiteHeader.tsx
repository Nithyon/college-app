"use client";

import Link from "next/link";
import { useTheme } from "@/hooks/useTheme";
import { CenteredContainer } from "./CenteredContainer";

const nav = [
  { href: "/", label: "Home" },
  { href: "/chat", label: "Assistant" },
  { href: "/knowledge", label: "Knowledge" },
  { href: "/admin", label: "Admin" },
];

export function SiteHeader() {
  const { theme, setTheme } = useTheme();
  return (
    <header className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
      <CenteredContainer className="flex flex-col items-center gap-4 py-8">
        <div className="font-display text-center text-sm tracking-[0.2em] text-[var(--color-text-muted)]">
          {process.env.NEXT_PUBLIC_COLLEGE_NAME || "Demo University"}
        </div>
        <nav className="flex flex-wrap justify-center gap-2 font-body text-xs uppercase tracking-widest">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="border border-transparent px-3 py-2 text-[var(--color-text)] hover:border-[var(--color-border)]"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="font-body text-xs uppercase tracking-widest text-[var(--color-text-muted)] underline decoration-[var(--color-border)] underline-offset-4"
        >
          {theme === "dark" ? "Light" : "Dark"} mode
        </button>
      </CenteredContainer>
    </header>
  );
}
