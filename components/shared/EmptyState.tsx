import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border border-dashed border-border bg-muted/30 px-6 py-10 text-center font-body text-sm",
        className
      )}
    >
      <p className="text-foreground">{title}</p>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </div>
  );
}
