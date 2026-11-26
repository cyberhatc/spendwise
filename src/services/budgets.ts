import type { Budget } from "@/types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((json as { error?: string }).error ?? "Request failed");
  return json as T;
}

export interface BudgetWithProgress extends Budget {
  spentThisMonth: number;
  remaining: number;
  percentUsed: number;
  status: "ok" | "warning" | "over";
}

export async function listBudgets(userId: string): Promise<Budget[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return [];
  const res = await fetch(`/api/budgets?userId=${encodeURIComponent(userId)}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Failed to load budgets");
  return json.data as Budget[];
}

export async function upsertBudget(input: {
  userId: string;
  category: string;
  monthly_limit: number;
  id?: string;
}): Promise<Budget> {
  const res = await fetch("/api/budgets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Failed to save budget");
  return json.data as Budget;
}

export async function deleteBudget(id: string, userId: string): Promise<void> {
  await apiFetch(`/api/budgets?userId=${encodeURIComponent(userId)}&id=${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function getBudgetsWithProgress(userId: string, transactions: { type?: string; category: string; amount: number; date: string }[]): Promise<BudgetWithProgress[]> {
  const budgets = await listBudgets(userId);
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const spentByCategory = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== "expense") continue;
    spentByCategory.set(t.category, (spentByCategory.get(t.category) ?? 0) + t.amount);
  }
  return budgets.map((b) => {
    const spentThisMonth = spentByCategory.get(b.category) ?? 0;
    const remaining = Math.max(0, b.monthly_limit - spentThisMonth);
    const percentUsed = b.monthly_limit > 0 ? (spentThisMonth / b.monthly_limit) * 100 : 0;
    const status = percentUsed >= 100 ? "over" : percentUsed >= 80 ? "warning" : "ok";
    return { ...b, spentThisMonth, remaining, percentUsed, status };
  });
}

export async function getSavingsSummary(transactions: { type: string; amount: number }[], savedAmount: number) {
  const income = transactions.filter((t) => t.type === "income").reduce((a, t) => a + t.amount, 0);
  const expenses = transactions.filter((t) => t.type === "expense").reduce((a, t) => a + t.amount, 0);
  return { savedAmount, income, expenses, totalSaved: savedAmount, savingsRate: income > 0 ? Math.round(((savedAmount) / income) * 100) : 0 };
}
