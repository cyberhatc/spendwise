"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatINR, formatDisplayDateShort, formatINRCompact } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useTransactions } from "@/hooks/useTransactions";
import { useGoals } from "@/hooks/useGoals";
import { useBudgets } from "@/hooks/useBudgets";
import { SpendingChart } from "@/components/charts/SpendingChart";
import { CategoryPieChart } from "@/components/charts/CategoryPieChart";
import { TransactionModal } from "@/components/transactions/TransactionModal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CardSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { categoryMeta } from "@/lib/constants";
import { categoryBreakdown, monthlySeries, summarize } from "@/lib/analytics";
import { CalendarDays, Plus, ArrowDownLeft, ArrowUpRight, PiggyBank, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { transactions, loading, error, add } = useTransactions({ pageSize: 1000 });
  const { goals } = useGoals();
  const { budgets } = useBudgets();

  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const summary = useMemo(() => summarize(transactions), [transactions]);
  const series = useMemo(() => monthlySeries(transactions, 6), [transactions]);
  const breakdown = useMemo(() => categoryBreakdown(transactions, "expense").slice(0, 6), [transactions]);
  const recent = useMemo(
    () => [...transactions].sort((a, b) => (b.date < a.date ? -1 : b.date > a.date ? 1 : b.created_at < a.created_at ? -1 : 1)).slice(0, 8),
    [transactions]
  );

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "there";

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const thisMonthKey = new Date().toISOString().slice(0, 7);
  const monthKey = (iso: string) => (iso ?? "").slice(0, 7);
  const monthTx = transactions.filter((t) => monthKey(t.date) === thisMonthKey);
  const monthIncome = monthTx.filter((t) => t.type === "income").reduce((a, t) => a + t.amount, 0);
  const monthExpenses = monthTx.filter((t) => t.type === "expense").reduce((a, t) => a + t.amount, 0);
  const monthSavings = monthIncome - monthExpenses;

  const budgetProgress = useMemo(() => {
    const now = new Date();
    const mk = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const spentByCat = new Map<string, number>();
    for (const t of transactions) {
      if (t.type !== "expense") continue;
      if (monthKey(t.date) !== mk) continue;
      spentByCat.set(t.category, (spentByCat.get(t.category) ?? 0) + t.amount);
    }
    return budgets
      .map((b) => {
        const spent = spentByCat.get(b.category) ?? 0;
        const percentUsed = b.monthly_limit > 0 ? (spent / b.monthly_limit) * 100 : 0;
        return { budget: b, spent, percentUsed, status: percentUsed >= 100 ? "over" as const : percentUsed >= 80 ? "warning" as const : "ok" as const };
      })
      .filter((x) => x.budget.category !== "Income")
      .slice(0, 5);
  }, [budgets, transactions]);

  const goalSaved = goals.reduce((a, g) => a + g.saved_amount, 0);
  const goalTarget = goals.reduce((a, g) => a + g.target_amount, 0);

  if (authLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <CardSkeleton className="h-80" />
          <CardSkeleton className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">
            {greeting}, {firstName}
          </h1>
          <p className="mt-1 text-sm text-ink-600">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/transactions" className="hidden sm:inline-flex">
            <Button variant="outline" size="lg">
              View all
            </Button>
          </Link>
          <Button size="lg" onClick={() => setQuickAddOpen(true)}>
            <Plus className="h-4 w-4" /> Add expense
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
          {error}
          <button className="ml-3 underline" onClick={() => router.refresh()}>Retry</button>
        </div>
      ) : null}

      {/* Stat cards */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="bg-ink-900 text-white border-0">
            <p className="text-sm font-medium text-white/70">Total balance</p>
            <p className="mt-2 font-display text-2xl font-bold sm:text-3xl">{formatINR(summary.balance)}</p>
            <p className="mt-2 text-xs text-white/60">Net of income &amp; expenses</p>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-ink-600">Income · {new Date().toLocaleDateString("en-IN", { month: "short" })}</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><ArrowDownLeft className="h-5 w-5" /></span>
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-ink-900">{formatINR(monthIncome)}</p>
            <p className="mt-2 text-xs text-ink-500">Money in</p>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-ink-600">Expenses · {new Date().toLocaleDateString("en-IN", { month: "short" })}</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500"><ArrowUpRight className="h-5 w-5" /></span>
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-ink-900">{formatINR(monthExpenses)}</p>
            <p className="mt-2 text-xs text-ink-500">Money out</p>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-ink-600">Savings · {new Date().toLocaleDateString("en-IN", { month: "short" })}</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><PiggyBank className="h-5 w-5" /></span>
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-ink-900">{formatINR(Math.max(0, monthSavings))}</p>
            <p className="mt-2 text-xs text-ink-500">Income minus expenses</p>
          </Card>
        </div>
      )}

      {/* Charts + breakdown */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-ink-900">Spending overview</h2>
              <p className="text-sm text-ink-500">Income vs expenses · last 6 months</p>
            </div>
            <Link href="/analytics" className="text-sm font-semibold text-primary-600 hover:text-primary-700">Analytics →</Link>
          </div>
          {loading ? <Skeleton className="mt-6 h-72" /> : <SpendingChart data={series} height={280} />}
        </Card>
        <Card>
          <h2 className="font-semibold text-ink-900">Category breakdown</h2>
          <p className="text-sm text-ink-500">Where your money went</p>
          {loading ? <Skeleton className="mt-6 h-72" /> : <CategoryPieChart data={breakdown} height={280} />}
        </Card>
      </div>

      {/* Budgets + recent */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ink-900">Monthly budgets</h2>
            <Link href="/budgets" className="text-sm font-semibold text-primary-600 hover:text-primary-700">Manage →</Link>
          </div>
          <div className="mt-5 space-y-4">
            {budgetProgress.length === 0 ? (
              <p className="text-sm text-ink-500">No budgets yet. Create one to stay on track.</p>
            ) : (
              budgetProgress.map(({ budget, spent, percentUsed, status }) => {
                const meta = categoryMeta(budget.category);
                const Icon = meta.icon;
                return (
                  <div key={budget.id}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 font-medium text-ink-800">
                        <Icon className="h-4 w-4" style={{ color: meta.color }} /> {budget.category}
                      </span>
                      <span className="text-ink-600">
                        {formatINR(spent)} / {formatINR(budget.monthly_limit)}
                      </span>
                    </div>
                    <div className="mt-2">
                      <ProgressBar value={percentUsed} status={status} size="sm" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {goalTarget > 0 ? (
            <div className="mt-6 rounded-2xl bg-primary-50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-primary-800">Total saved across goals</span>
                <span className="font-semibold text-primary-800">{formatINR(goalSaved)}</span>
              </div>
              <div className="mt-2">
                <ProgressBar value={goalTarget > 0 ? (goalSaved / goalTarget) * 100 : 0} size="sm" />
              </div>
              <Link href="/savings" className="mt-3 inline-block text-xs font-semibold text-primary-700 hover:text-primary-800">View goals →</Link>
            </div>
          ) : null}
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-ink-900">Recent transactions</h2>
              <p className="text-sm text-ink-500">Your latest activity</p>
            </div>
            <Link href="/transactions" className="text-sm font-semibold text-primary-600 hover:text-primary-700">View all →</Link>
          </div>
          {loading ? (
            <div className="mt-4 space-y-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-10 w-40" />
                  <Skeleton className="h-10 w-24" />
                </div>
              ))}
            </div>
          ) : recent.length === 0 ? (
            <EmptyState
              title="No transactions yet"
              description="Add your first expense or income to see it here."
              action={
                <Button size="sm" onClick={() => setQuickAddOpen(true)}>
                  <Plus className="h-4 w-4" /> Add expense
                </Button>
              }
            />
          ) : (
            <ul className="mt-4 divide-y divide-mist">
              {recent.map((t) => {
                const meta = categoryMeta(t.category);
                const Icon = meta.icon;
                const isIncome = t.type === "income";
                return (
                  <li key={t.id} className="flex items-center gap-3 py-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${meta.color}1A`, color: meta.color }}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink-900">{t.description}</p>
                      <p className="text-xs text-ink-500">{meta.label} · {formatDisplayDateShort(t.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${isIncome ? "text-emerald-600" : "text-ink-900"}`}>
                        {isIncome ? "+" : "-"}{formatINRCompact(t.amount)}
                      </p>
                      <p className="text-xs text-ink-500">{formatINR(t.amount)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      {/* Quick add */}
      <TransactionModal open={quickAddOpen} onClose={() => setQuickAddOpen(false)} defaultType="expense" />

      {/* Mobile quick add FAB */}
      <button
        type="button"
        onClick={() => setQuickAddOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary-500 text-white shadow-cardHover transition-all hover:bg-primary-600 lg:hidden"
        aria-label="Add expense"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}
