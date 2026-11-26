import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0 - 100
  status?: "ok" | "warning" | "over";
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md";
}

export function ProgressBar({ value, status, className, showLabel = false, size = "md" }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const effectiveStatus = status ?? (clamped >= 100 ? "over" : clamped >= 80 ? "warning" : "ok");
  const color =
    effectiveStatus === "over"
      ? "bg-red-500"
      : effectiveStatus === "warning"
        ? "bg-amber-500"
        : "bg-primary-500";
  const height = size === "sm" ? "h-1.5" : "h-2.5";
  return (
    <div className={cn("w-full", className)}>
      <div className={cn("w-full overflow-hidden rounded-full bg-mist", height)}>
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out", color)}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel ? (
        <p className="mt-1 text-xs font-medium text-ink-600">
          {clamped.toFixed(0)}% used
        </p>
      ) : null}
    </div>
  );
}
