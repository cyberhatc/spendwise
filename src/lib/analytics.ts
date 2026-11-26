import type { Transaction, TransactionType } from "@/types";

export interface CategoryTotal {
  category: string;
  amount: number;
  percentage: number;
}

export interface MonthlyPoint {
  /** yyyy-mm */
  key: string;
  label: string;
  income: number;
  expenses: number;
  savings: number;
}

export interface SpendingSummary {
  income: number;
  expenses: number;
  savings: number;
  balance: number;
}

export const emptySummary = (): SpendingSummary => ({
  income: 0,
  expenses: 0,
  savings: 0,
  balance: 0,
});

export function summarize(transactions: Transaction[]): SpendingSummary {
  let income = 0;
  let expenses = 0;
  for (const t of transactions) {
    if (t.type === "income") income += t.amount;
    else expenses += t.amount;
  }
  const savings = Math.max(0, income - expenses);
  return { income, expenses, savings, balance: income - expenses };
}

/** Aggregate transactions into month buckets (oldest first, `count` months). */
export function monthlySeries(
  transactions: Transaction[],
  count = 6
): MonthlyPoint[] {
  const now = new Date();
  const buckets: MonthlyPoint[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    buckets.push({
      key,
      label: d.toLocaleDateString("en-IN", { month: "short" }),
      income: 0,
      expenses: 0,
      savings: 0,
    });
  }
  const map = new Map(buckets.map((b) => [b.key, b]));
  for (const t of transactions) {
    const key = (t.date ?? "").slice(0, 7);
    const bucket = map.get(key);
    if (!bucket) continue;
    if (t.type === "income") bucket.income += t.amount;
    else bucket.expenses += t.amount;
  }
  for (const b of buckets) {
    b.savings = Math.max(0, b.income - b.expenses);
  }
  return buckets;
}

/** Income vs expense for the last `weeks` weeks (oldest first). */
export function weeklySeries(
  transactions: Transaction[],
  weeks = 8
): { label: string; income: number; expenses: number }[] {
  const now = new Date();
  const buckets: { label: string; income: number; expenses: number }[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const end = new Date(now);
    end.setDate(end.getDate() - i * 7);
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    const inRange = (iso: string) => {
      const t = iso ? new Date(`${iso}T00:00:00`).getTime() : NaN;
      if (Number.isNaN(t)) return false;
      return t >= start.getTime() && t <= end.getTime();
    };
    let income = 0;
    let expenses = 0;
    for (const t of transactions) {
      const amount = t.amount;
      const matched = inRange(t.date);
      if (t.type === "income" && matched) income += amount;
      if (t.type === "expense" && matched) expenses += amount;
    }
    buckets.push({
      label: start.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      income,
      expenses,
    });
  }
  return buckets;
}

/** Category breakdown for a set of transactions. */
export function categoryBreakdown(
  transactions: Transaction[],
  type: TransactionType | "all"
): CategoryTotal[] {
  const map = new Map<string, number>();
  for (const t of transactions) {
    if (type !== "all" && t.type !== type) continue;
    const key = t.category || "Other";
    map.set(key, (map.get(key) ?? 0) + t.amount);
  }
  const total = [...map.values()].reduce((a, b) => a + b, 0);
  const rows: CategoryTotal[] = [...map.entries()]
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
  return rows;
}

/** Overall savings rate: savings / income. */
export function savingsRate(transactions: Transaction[]): number {
  const s = summarize(transactions);
  if (s.income <= 0) return 0;
  return s.income > 0 ? Math.min(100, (s.savings / s.income) * 100) : 0;
}

/** Expenses for a given yyyy-mm key. */
export function expensesInMonth(transactions: Transaction[], monthKey: string): number {
  let total = 0;
  for (const t of transactions) {
    if (t.type !== "expense") continue;
    if ((t.date ?? "").slice(0, 7) === monthKey) total += t.amount;
  }
  return total;
}

export function incomeInMonth(transactions: Transaction[], monthKey: string): number {
  let total = 0;
  for (const t of transactions) {
    if (t.type !== "income") continue;
    if ((t.date ?? "").slice(0, 7) === monthKey) total += t.amount;
  }
  return total;
}
