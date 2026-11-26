import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "default" | "success" | "warning" | "danger" | "info" | "violet";

interface BadgeProps {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}

const toneClasses: Record<BadgeTone, string> = {
  default: "bg-mist text-ink-700",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-600",
  info: "bg-primary-50 text-primary-700",
  violet: "bg-violet-50 text-violet-600",
};

export function Badge({ tone = "default", className, children }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", toneClasses[tone], className)}>
      {children}
    </span>
  );
}
