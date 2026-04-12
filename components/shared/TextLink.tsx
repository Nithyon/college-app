import Link from "next/link";
import { cn } from "@/lib/utils";

export function TextLink({
  href,
  children,
  className,
  external,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
}) {
  const base =
    "font-body text-sm underline decoration-border underline-offset-4 text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cn(base, className)}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cn(base, className)}>
      {children}
    </Link>
  );
}
