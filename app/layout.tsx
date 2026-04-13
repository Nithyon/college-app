import type { Metadata } from "next";
import { EB_Garamond, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SiteHeader } from "@/components/layout/SiteHeader";

const display = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const body = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-body",
});

const college = process.env.NEXT_PUBLIC_COLLEGE_NAME || "SRM Institute of Science and Technology";

export const metadata: Metadata = {
  title: `${college} — AI Assistant`,
  description: "Official SRMIST admissions, contacts, fee references, and student support assistant.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${display.variable} ${body.variable} min-h-screen antialiased`}>
        <ThemeProvider>
          <SiteHeader />
          {children}
          <footer className="border-t border-[var(--color-border)] py-10 text-center font-body text-xs text-[var(--color-text-muted)]">
            Official SRMIST references · Verify live admissions pages before acting
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
