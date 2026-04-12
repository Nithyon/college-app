import { cn } from "@/lib/utils";

export function CenteredContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("mx-auto w-full max-w-[960px] px-4", className)}>{children}</div>;
}
