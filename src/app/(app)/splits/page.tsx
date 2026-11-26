"use client";

import React, { useState } from "react";
import { formatINR } from "@/lib/utils";
import { useSplits } from "@/hooks/useSplits";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { CardSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { Users, Plus, CheckCircle2, Trash2 } from "lucide-react";

export default function SplitsPage() {
  const { splits, loading, error, create, settle, remove } = useSplits();
  const [open, setOpen] = useState(false);
  const [expense_name, setExpense_name] = useState("");
  const [amount, setAmount] = useState("");
  const [paid_by, setPaid_by] = useState("");
  const [participants, setParticipants] = useState("");
  const [status, setStatus] = useState<"settled" | "pending">("pending");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(amount);
    const parts = participants.split(",").map((p) => p.trim()).filter(Boolean);
    if (!expense_name.trim() || !Number.isFinite(value) || value <= 0 || !paid_by.trim() || parts.length === 0) return;
    setSaving(true);
    try {
      await create({ expense_name: expense_name.trim(), amount: value, paid_by: paid_by.trim(), participants: parts, status });
      setOpen(false);
      setExpense_name("");
      setAmount("");
      setPaid_by("");
      setParticipants("");
      setStatus("pending");
    } finally {
      setSaving(false);
    }
  };

  const pendingTotal = splits.filter((s) => s.status === "pending").reduce((a, s) => a + s.amount, 0);

  if (loading && splits.length === 0) {
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
          <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">Split expenses</h1>
          <p className="mt-1 text-sm text-ink-600">Share group expenses with friends and settle up.</p>
        </div>
        <Button onClick={() => setOpen((v) => !v)}>
          <Plus className="h-4 w-4" /> Add split
        </Button>
      </div>

      {error ? <div className="rounded-2xl bg-red-50 px-5 py-4 text-sm font-medium text-red-600">{error}</div> : null}

      {open ? (
        <Card>
          <h2 className="font-semibold text-ink-900">Add group expense</h2>
          <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input label="Expense name" placeholder="e.g. Cab + stay — Goa trip" value={expense_name} onChange={(e) => setExpense_name(e.target.value)} required />
            <Input label="Amount (₹)" type="number" min={1} placeholder="e.g. 5400" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            <Input label="Paid by" placeholder="e.g. Aarav Mehta" value={paid_by} onChange={(e) => setPaid_by(e.target.value)} required />
            <Input label="Participants (comma separated)" placeholder="e.g. Aarav Mehta, Riya Sharma, Rahul" value={participants} onChange={(e) => setParticipants(e.target.value)} required />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-800">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as "settled" | "pending")} className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100">
                <option value="pending">Pending</option>
                <option value="settled">Settled</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button type="submit" loading={saving}>Save split</Button>
            </div>
          </form>
        </Card>
      ) : null}

      {splits.length === 0 ? (
        <Card><p className="text-sm text-ink-600">No splits yet. Add a group expense to start splitting costs.</p></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {splits.map((s) => (
            <Card key={s.id}>
              <div className="flex items-start justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                  <Users className="h-5 w-5" />
                </span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.status === "settled" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                  {s.status}
                </span>
              </div>
              <h3 className="mt-4 font-semibold text-ink-900">{s.expense_name}</h3>
              <p className="mt-1 text-sm text-ink-600">Total {formatINR(s.amount)} · Paid by {s.paid_by}</p>
              <p className="mt-1 text-xs text-ink-500">Participants: {s.participants.join(", ")}</p>
              <div className="mt-4 flex items-center justify-between">
                <button type="button" className="text-sm font-semibold text-primary-600 hover:text-primary-700" onClick={() => void settle(s.id, s.status === "settled" ? "pending" : "settled")}>
                  {s.status === "settled" ? "Mark unsettled" : "Mark settled"}
                </button>
                <button type="button" onClick={() => void remove(s.id)} className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-red-50 hover:text-red-600" aria-label={`Delete split ${s.expense_name}`}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {splits.length > 0 ? (
        <div className="rounded-2xl bg-primary-50 p-5 text-center">
          <p className="text-sm font-semibold text-primary-800">Pending settlements</p>
          <p className="mt-1 font-display text-2xl font-bold text-primary-900">{formatINR(pendingTotal)}</p>
        </div>
      ) : null}
    </div>
  );
}
