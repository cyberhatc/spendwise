"use client";

import React, { useMemo, useState } from "react";
import { formatINR, formatINRCompact, downloadCSV } from "@/lib/utils";
import { useTransactions } from "@/hooks/useTransactions";
import { SpendingChart, type SpendingChartProps } from "@/components/charts/SpendingChart";
import { IncomeExpenseChart } from "@/components/charts/IncomeExpenseChart";
import { CategoryPieChart } from "@/components/charts/CategoryPieChart";
import { CategoryBarChart } from "@/components/charts/CategoryBarChart";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CardSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { categoryBreakdown, monthlySeries, summarize, weeklySeries } from "@/lib/analytics";
import { categoryMeta } from "@/lib/constants";
import { Download } from "lucide-react";

type Period = "week" | "month" | "year";

export default function AnalyticsPage() {
  const { transactions, loading, error } = useTransactions({ pageSize: 1000 });
  const [period, setPeriod] = useState<Period>("month");

  const summary = useMemo(() => summarize(transactions), [transactions]);
  const monthly = useMemo(() => monthlySeries(transactions, 12), [transactions]);
  const weekly = useMemo(() => weeklySeries(transactions, 8), [transactions]);
  const expenseBreakdown = useMemo(() => categoryBreakdown(transactions, "expense"), [transactions]);
  const incomeBreakdown = useMemo(() => categoryBreakdown(transactions, "income"), [transactions]);

  const comparison = useMemo(() => {
    const map = new Map<string, { income: number; expenses: number }>();
    const now = new Date();
    const mk = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    for (const t of transactions) {
      const key = (t.date ?? "").slice(0, 7);
      const cur = map.get(key) ?? { income: 0, expenses: 0 };
      if (t.type === "income") cur.income += t.amount;
      else cur.expenses += t.amount;
      map.set(key, cur);
    }
    return [...map.entries()]
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .slice(-6)
      .map(([key, v]) => ({ key, label: key, ...v }));
  }, [transactions]);

  const exportCsv = () => {
    const rows = [...transactions]
      .sort((a, b) => (b.date < a.date ? -1 : 1))
      .map((t) => ({
        Date: t.date,
        Type: t.type,
        Category: t.category,
        Description: t.description,
        Amount: t.amount.toFixed(2),
      }));
    downloadCSV(`spendwise-transactions-${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 lg:grid-cols-2">
          <CardSkeleton className="h-80" />
          <CardSkeleton className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">Analytics</h1>
          <p className="mt-1 text-sm text-ink-600">Reports across weeks, months and years.</p>
        </div>
        <Button variant="outline" onClick={exportCsv}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {error ? <div className="rounded-2xl bg-red-50 px-5 py-4 text-sm font-medium text-red-600">{error}</div> : null}

      <div className="flex gap-2">
        {(["week", "month", "year"] as Period[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={`rounded-full px-5 py-2 text-sm font-semibold capitalize transition-all ${
              period === p ? "bg-primary-500 text-white shadow-soft" : "bg-white text-ink-700 border border-line hover:border-primary-200"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {period === "week" ? (
        <Card>
          <h2 className="font-semibold text-ink-900">Weekly income vs expenses</h2>
          <p className="text-sm text-ink-500">Last 8 weeks</p>
          {weekly.length > 0 ? <IncomeExpenseChart data={weekly} height={300} /> : <p className="py-10 text-center text-sm text-ink-500">Not enough data for weekly reports yet.</p>}
        </Card>
      ) : period === "month" ? (
        <Card>
          <h2 className="font-semibold text-ink-900">Monthly income vs expenses</h2>
          <p className="text-sm text-ink-500">Last 12 months</p>
          {monthly.length > 0 ? <SpendingChart data={monthly} height={320} /> : <p className="py-10 text-center text-sm text-ink-500">No data yet.</p>}
        </Card>
      ) : (
        <Card>
          <h2 className="font-semibold text-ink-900">Yearly spending breakdown</h2>
          <p className="text-sm text-ink-500">Expenses by category for the last 12 months</p>
          <div className="mt-4">
            <CategoryBarChart
              data={expenseBreakdown.map((b) => ({ category: b.category, amount: b.amount, color: categoryMeta(b.category).color }))}
              height={320}
            />
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold text-ink-900">Category comparison</h2>
          <p className="text-sm text-ink-500">Top spending categories</p>
          <div className="mt-4">
            <CategoryPieChart data={expenseBreakdown.slice(0, 6)} height={280} />
          </div>
        </Card>
        <Card>
          <h2 className="font-semibold text-ink-900">Income vs expense comparison</h2>
          <p className="text-sm text-ink-500">Monthly net</p>
          <div className="mt-4">
            <CategoryBarChart
              data={comparison.map((c) => ({
                category: new Date(Number(c.key.split("-")[0]), Number(c.key.split("-")[1]) - 1).toLocaleDateString("en-IN", { month: "short" }),
                amount: c.income - c.expenses,
              }))}
              height={280}
            />
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="font-semibold text-ink-900">Income breakdown</h2>
        <p className="text-sm text-ink-500">Where your income came from</p>
        {incomeBreakdown.length > 0 ? <CategoryPieChart data={incomeBreakdown} type="income" height={280} /> : <p className="py-10 text-center text-sm text-ink-500">No income recorded yet.</p>}
      </Card>
    </div>
  );
}
