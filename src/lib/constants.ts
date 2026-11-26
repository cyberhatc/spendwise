import type { LucideIcon } from "lucide-react";
import {
  UtensilsCrossed,
  Car,
  GraduationCap,
  ShoppingBag,
  Clapperboard,
  Home,
  Receipt,
  HeartPulse,
  Shapes,
} from "lucide-react";

export const APP_NAME = "SpendWise";

export const TAGLINE = "Track Smart. Spend Better. Save More.";

export const PRIMARY_COLOR = "#6C63FF";

export type CategoryKey =
  | "Food"
  | "Transport"
  | "Education"
  | "Shopping"
  | "Entertainment"
  | "Rent"
  | "Bills"
  | "Health"
  | "Other"
  | "Income";

export interface CategoryMeta {
  value: string;
  label: string;
  color: string;
  icon: LucideIcon;
}

export const EXPENSE_CATEGORIES: CategoryMeta[] = [
  { value: "Food", label: "Food & Dining", color: "#F59E0B", icon: UtensilsCrossed },
  { value: "Transport", label: "Transport", color: "#3B82F6", icon: Car },
  { value: "Education", label: "Education", color: "#8B5CF6", icon: GraduationCap },
  { value: "Shopping", label: "Shopping", color: "#EC4899", icon: ShoppingBag },
  { value: "Entertainment", label: "Entertainment", color: "#EF4444", icon: Clapperboard },
  { value: "Rent", label: "Rent", color: "#6366F1", icon: Home },
  { value: "Bills", label: "Bills & Utilities", color: "#14B8A6", icon: Receipt },
  { value: "Health", label: "Health", color: "#F43F5E", icon: HeartPulse },
  { value: "Other", label: "Other", color: "#94A3B8", icon: Shapes },
];

export const INCOME_CATEGORIES: CategoryMeta[] = [
  { value: "Income", label: "Income", color: "#10B981", icon: ShoppingBag },
];

export const ALL_CATEGORIES: CategoryMeta[] = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export const categoryMeta = (value: string): CategoryMeta =>
  ALL_CATEGORIES.find((c) => c.value === value) ?? {
    value,
    label: value,
    color: "#6C63FF",
    icon: Shapes,
  };

export const INCOME_CATEGORY_VALUES = ["Income"] as const;

export const EXPENSE_CATEGORY_VALUES = EXPENSE_CATEGORIES.map((c) => c.value);

export const EXPENSE_CATEGORY_VALUES_SET = new Set(EXPENSE_CATEGORY_VALUES);

export const FREQUENCIES = ["daily", "weekly", "monthly"] as const;
export type Frequency = (typeof FREQUENCIES)[number];
