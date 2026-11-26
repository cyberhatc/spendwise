"use client";

import React, { useMemo, useState } from "react";
import { formatINR } from "@/lib/utils";
import { useTransactions } from "@/hooks/useTransactions";
import { useBudgets } from "@/hooks/useBudgets";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { CardSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { categoryMeta } from "@/lib/constants";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { AlertTriangle, CheckCircle2, XCircle, Plus } from "lucide-react";

export default function BudgetsPage() {
  const { transactions, loading: txLoading } = useTransactions({ pageSize: 1000 });
  const { budgets, loading, error, reload, save } = useBudgets();

  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0].value);
  const [limit, setLimit] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const spentByCat = useMemo(() => {
    const now = new Date();
    const mk = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const map = new Map<string, number>();
    for (const t of transactions) {
      if (t.type !== "expense") continue;
      if ((t.date ?? "").slice(0, 7) !== mk) continue;
      map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
    }
    return map;
  }, [transactions]);

  const monthLabel = new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(limit);
    if (!Number.isFinite(value) || value <= 0) return;
    setSaving(true);
    try {
      await save({ category, monthly_limit: value });
      setLimit("");
    } finally {
      setSaving(false);
    }
  };

  if (loading && budgets.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">Budget planner</h1>
          <p className="mt-1 text-sm text-ink-600">Monthly budgets for {monthLabel} — warnings at 80% and 100%</p>
        </div>
      </div>

      {error ? <div className="rounded-2xl bg-red-50 px-5 py-4 text-sm font-medium text-red-600">{error}</div> : null}

      <Card>
        <h2 className="font-semibold text-ink-900">Create or update a category budget</h2>
        <form onSubmit={submit} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 sm:w-56">
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={1}
            placeholder="Monthly limit (₹)"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 sm:w-48"
          />
          <Button type="submit" loading={saving}>
            <Plus className="h-4 w-4" /> Save budget
          </Button>
        </form>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {budgets.length === 0 ? (
          <Card className="sm:col-span-full">
            <p className="text-sm text-ink-600">No budgets yet. Create your first category budget above.</p>
          </Card>
        ) : (
          budgets
            .filter((b) => b.category !== "Income")
            .map((b) => {
              const meta = categoryMeta(b.category);
              const Icon = meta.icon;
              const spent = spentByCat.get(b.category) ?? 0;
              const percentUsed = b.monthly_limit > 0 ? (spent / b.monthly_limit) * 100 : 0;
              const status = percentUsed >= 100 ? "over" : percentUsed >= 80 ? "warning" : "ok";
              const statusBadge = status === "over" ? { tone: "danger" as const, label: "Over budget" } : status === "warning" ? { tone: "warning" as const, label: "At 80%+" } : { tone: "success" as const, label: "On track" };
              return (
                <Card key={b.id} className={status === "over" ? "border-red-200" : undefined}>
                  <div className="flex items-start justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ backgroundColor: `${meta.color}1A`, color: meta.color }}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <Badge tone={statusBadge.tone}>{statusBadge.label}</Badge>
                  </div>
                  <h3 className="mt-4 font-semibold text-ink-900">{b.category}</h3>
                  <p className="mt-1 text-sm text-ink-600">
                    Spent {formatINR(spent)} of {formatINR(b.monthly_limit)}
                  </p>
                  <div className="mt-4">
                    <ProgressBar value={percentUsed} status={status} showLabel />
                  </div>
                  {status === "over" ? (
                    <p className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                      <AlertTriangle className="h-4 w-4" /> Budget exceeded. Consider cutting back this month.
                    </p>
                  ) : status === "warning" ? (
                    <p className="mt-3 flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                      <AlertTriangle className="h-4 w-4" /> At 80% of your budget — time to slow down.
                    </p>
                  ) : (
                    <p className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" /> Great job, you&apos;re on track.
                    </p>
                  )}
                </Card>
              );
            })
          )
        }
      </div>

      {txLoading ? <p className="text-sm text-ink-500">Loading spend data…</p> : null}
    </div>
  );
}
