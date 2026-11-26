"use client";

import React, { useState } from "react";
import { Flame, Plus, Trash2 } from "lucide-react";
import { useChallenges } from "@/hooks/useChallenges";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { CardSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function ChallengesPage() {
  const { challenges, loading, error, create, update, remove } = useChallenges();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [target_spend, setTarget_spend] = useState("");
  const [start_date, setStart_date] = useState("");
  const [end_date, setEnd_date] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = Number(target_spend);
    if (!title.trim() || !Number.isFinite(t) || t <= 0 || !start_date || !end_date) return;
    setSaving(true);
    try {
      await create({ title: title.trim(), target_spend: t, start_date, end_date });
      setOpen(false);
      setTitle("");
      setTarget_spend("");
      setStart_date("");
      setEnd_date("");
    } finally {
      setSaving(false);
    }
  };

  const totalTarget = challenges.reduce((a, c) => a + c.target_spend, 0);
  const totalSpent = challenges.reduce((a, c) => a + c.spent_amount, 0);

  if (loading && challenges.length === 0) {
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
          <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">No-spend challenges</h1>
          <p className="mt-1 text-sm text-ink-600">Create fun challenges to avoid impulse spending.</p>
        </div>
        <Button onClick={() => setOpen((v) => !v)}>
          <Plus className="h-4 w-4" /> New challenge
        </Button>
      </div>

      {error ? <div className="rounded-2xl bg-red-50 px-5 py-4 text-sm font-medium text-red-600">{error}</div> : null}

      {open ? (
        <Card>
          <h2 className="font-semibold text-ink-900">Start a no-spend challenge</h2>
          <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input label="Challenge name" placeholder="e.g. No junk food October" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <Input label="Target spend (₹)" type="number" min={1} placeholder="e.g. 2000" value={target_spend} onChange={(e) => setTarget_spend(e.target.value)} required />
            <Input label="Start date" type="date" value={start_date} onChange={(e) => setStart_date(e.target.value)} required />
            <Input label="End date" type="date" value={end_date} onChange={(e) => setEnd_date(e.target.value)} required />
            <div className="flex items-end">
              <Button type="submit" loading={saving}>Start challenge</Button>
            </div>
          </form>
        </Card>
      ) : null}

      {challenges.length === 0 ? (
        <Card><p className="text-sm text-ink-600">No challenges yet. Start one to build a spending-free streak.</p></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {challenges.map((c) => {
            const pct = c.target_spend > 0 ? (c.spent_amount / c.target_spend) * 100 : 0;
            const active = c.is_active;
            return (
              <Card key={c.id} className={active ? "" : "opacity-70"}>
                <div className="flex items-start justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                    <Flame className="h-5 w-5" />
                  </span>
                  <button type="button" onClick={() => void update(c.id, { is_active: !c.is_active })} className="text-xs font-semibold text-primary-600 hover:text-primary-700">
                    {active ? "Pause" : "Resume"}
                  </button>
                </div>
                <h3 className="mt-4 font-semibold text-ink-900">{c.title}</h3>
                <p className="mt-1 text-sm text-ink-600">{active ? `Target: no spend · Budget: ${c.target_spend}` : "Paused"}</p>
                <div className="mt-4">
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-mist">
                    <div className="h-full rounded-full bg-orange-500" style={{ width: `${Math.min(100, pct)}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-ink-500">
                    {c.spent_amount} of {c.target_spend} spent
                  </p>
                </div>
                <div className="mt-4 flex justify-end">
                  <button type="button" onClick={() => void remove(c.id)} className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-red-50 hover:text-red-600" aria-label={`Delete challenge ${c.title}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {challenges.length > 0 ? (
        <Card className="flex items-center justify-between bg-primary-50">
          <div>
            <p className="text-sm font-semibold text-primary-800">Combined challenge spend</p>
            <p className="mt-1 font-display text-2xl font-bold text-primary-900">{totalSpent} / {totalTarget}</p>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
