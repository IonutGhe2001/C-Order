import { cn } from "../../lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "shimmer rounded bg-brand-muted transition-colors motion-reduce:transition-none",
        className
      )}
    />
  );
}