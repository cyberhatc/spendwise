"use client";

import React, { useMemo, useState } from "react";
import { formatINR, formatDisplayDate } from "@/lib/utils";
import { useGoals } from "@/hooks/useGoals";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { CardSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Target, Plus, Trash2 } from "lucide-react";
import type { SavingsGoal } from "@/types";

export default function SavingsPage() {
  const { goals, loading, error, reload, create, update, remove } = useGoals();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [saved, setSaved] = useState("");
  const [deadline, setDeadline] = useState("");
  const [saving, setSaving] = useState(false);

  const sorted = useMemo(() => [...goals].sort((a, b) => (a.deadline < b.deadline ? -1 : 1)), [goals]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = Number(target);
    const s = Number(saved || 0);
    if (!name.trim() || !Number.isFinite(t) || t <= 0 || !deadline) return;
    setSaving(true);
    try {
      await create({ name: name.trim(), target_amount: t, saved_amount: s, deadline });
      setName("");
      setTarget("");
      setSaved("");
      setDeadline("");
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (g: SavingsGoal) => {
    await remove(g.id);
  };

  const progressFor = (g: SavingsGoal) => (g.target_amount > 0 ? (g.saved_amount / g.target_amount) * 100 : 0);

  if (loading && goals.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
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
          <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">Savings goals</h1>
          <p className="mt-1 text-sm text-ink-600">Set targets and track your progress.</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4" /> New goal
        </Button>
      </div>

      {error ? <div className="rounded-2xl bg-red-50 px-5 py-4 text-sm font-medium text-red-600">{error}</div> : null}

      {showForm ? (
        <Card>
          <h2 className="font-semibold text-ink-900">Create savings goal</h2>
          <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input label="Goal name" placeholder="e.g. Emergency fund" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Target amount (₹)" type="number" min={1} placeholder="e.g. 30000" value={target} onChange={(e) => setTarget(e.target.value)} required />
            <Input label="Already saved (₹)" type="number" min={0} placeholder="e.g. 12000" value={saved} onChange={(e) => setSaved(e.target.value)} />
            <Input label="Target date" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} required />
            <div className="flex items-end sm:col-span-2">
              <Button type="submit" loading={saving}>
                Create goal
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      {sorted.length === 0 ? (
        <EmptyState title="No savings goals yet" description="Create your first goal to start building savings." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((g) => {
            const pct = progressFor(g);
            const completed = g.saved_amount >= g.target_amount;
            const daysLeft = Math.ceil((new Date(g.deadline).getTime() - Date.now()) / 86400000);
            return (
              <Card key={g.id} className={completed ? "border-emerald-200" : undefined}>
                <div className="flex items-start justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                    <Target className="h-5 w-5" />
                  </span>
                  <button type="button" onClick={() => onDelete(g)} className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-red-50 hover:text-red-600" aria-label={`Delete goal ${g.name}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="mt-4 font-semibold text-ink-900">{g.name}</h3>
                <p className="mt-1 text-sm text-ink-600">Target {formatINR(g.target_amount)} · Saved {formatINR(g.saved_amount)}</p>
                <div className="mt-4">
                  <ProgressBar value={pct} status={completed ? "ok" : pct >= 80 ? "warning" : "ok"} showLabel />
                </div>
                <p className="mt-3 text-xs text-ink-500">
                  {completed ? "Goal reached — congratulations!" : `Deadline ${formatDisplayDate(g.deadline)} · ${Math.max(0, daysLeft)} days left`}
                </p>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
