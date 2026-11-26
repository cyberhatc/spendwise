"use client";

import React, { useState } from "react";
import { Repeat, Plus, Trash2 } from "lucide-react";
import { useRecurring } from "@/hooks/useRecurring";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { CardSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { todayISO } from "@/lib/utils";

export default function RecurringPage() {
  const { items, loading, error, create, remove } = useRecurring();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0].value);
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">("monthly");
  const [next_date, setNext_date] = useState(todayISO());
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0 || description.trim().length < 2) return;
    setSaving(true);
    try {
      await create({ type, amount: value, category, description: description.trim(), frequency, next_date, is_active: true });
      setOpen(false);
      setAmount("");
      setDescription("");
    } finally {
      setSaving(false);
    }
  };

  if (loading && items.length === 0) {
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
          <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">Recurring expenses</h1>
          <p className="mt-1 text-sm text-ink-600">Subscriptions and regular payments you want to track automatically.</p>
        </div>
        <Button onClick={() => setOpen((v) => !v)}>
          <Plus className="h-4 w-4" /> Add recurring
        </Button>
      </div>

      {error ? <div className="rounded-2xl bg-red-50 px-5 py-4 text-sm font-medium text-red-600">{error}</div> : null}

      {open ? (
        <Card>
          <h2 className="font-semibold text-ink-900">New recurring entry</h2>
          <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-800">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value as "income" | "expense")} className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100">
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-800">Amount (₹)</label>
              <input type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100" required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-800">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100">
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-800">Description</label>
              <input value={description} onChange={(e) => setDescription(e.target.value)} className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100" required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-800">Frequency</label>
              <select value={frequency} onChange={(e) => setFrequency(e.target.value as "daily" | "weekly" | "monthly")} className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-800">Next date</label>
              <input type="date" value={next_date} onChange={(e) => setNext_date(e.target.value)} className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100" />
            </div>
            <div className="flex items-end">
              <Button type="submit" loading={saving}>Save recurring</Button>
            </div>
          </form>
        </Card>
      ) : null}

      {items.length === 0 ? (
        <Card><p className="text-sm text-ink-600">No recurring entries yet.</p></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((r) => (
            <Card key={r.id}>
              <div className="flex items-start justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                  <Repeat className="h-5 w-5" />
                </span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${r.is_active ? "bg-emerald-50 text-emerald-700" : "bg-mist text-ink-500"}`}>{r.is_active ? "Active" : "Paused"}</span>
              </div>
              <h3 className="mt-4 font-semibold text-ink-900">{r.description}</h3>
              <p className="mt-1 text-sm text-ink-600">{r.type === "income" ? "+" : "-"}{r.amount} · {r.category}</p>
              <p className="mt-1 text-xs text-ink-500">Frequency: {r.frequency} · Next: {r.next_date}</p>
              <div className="mt-4 flex justify-end">
                <button type="button" onClick={() => void remove(r.id)} className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-red-50 hover:text-red-600" aria-label={`Delete ${r.description}`}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
