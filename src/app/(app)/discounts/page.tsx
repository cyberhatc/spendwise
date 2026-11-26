"use client";

import React, { useState } from "react";
import { BadgePercent, Plus, Trash2 } from "lucide-react";
import { useDiscounts } from "@/hooks/useDiscounts";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { CardSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { Tag } from "lucide-react";

export default function DiscountsPage() {
  const { discounts, loading, error, create, remove } = useDiscounts();
  const [open, setOpen] = useState(false);
  const [provider, setProvider] = useState("");
  const [item, setItem] = useState("");
  const [discount, setDiscount] = useState("");
  const [code, setCode] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const d = Number(discount);
    if (!provider.trim() || !item.trim() || !Number.isFinite(d) || d <= 0) return;
    setSaving(true);
    try {
      await create({ provider: provider.trim(), item: item.trim(), discount: d, code: code.trim() || undefined, url: url.trim() || undefined, notes: notes.trim() || undefined });
      setOpen(false);
      setProvider("");
      setItem("");
      setDiscount("");
      setCode("");
      setUrl("");
      setNotes("");
    } finally {
      setSaving(false);
    }
  };

  if (loading && discounts.length === 0) {
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
          <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">Student discounts</h1>
          <p className="mt-1 text-sm text-ink-600">Track offers and save on the things you love.</p>
        </div>
        <Button onClick={() => setOpen((v) => !v)}>
          <Plus className="h-4 w-4" /> Add discount
        </Button>
      </div>

      {error ? <div className="rounded-2xl bg-red-50 px-5 py-4 text-sm font-medium text-red-600">{error}</div> : null}

      {open ? (
        <Card>
          <h2 className="font-semibold text-ink-900">Add a student discount</h2>
          <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input label="Provider" placeholder="e.g. Amazon" value={provider} onChange={(e) => setProvider(e.target.value)} required />
            <Input label="Item" placeholder="e.g. Dining coupons" value={item} onChange={(e) => setItem(e.target.value)} required />
            <Input label="Discount %" type="number" min={1} max={90} placeholder="e.g. 10" value={discount} onChange={(e) => setDiscount(e.target.value)} required />
            <Input label="Code (optional)" placeholder="e.g. SAVE10" value={code} onChange={(e) => setCode(e.target.value)} />
            <Input label="URL (optional)" placeholder="https://…" value={url} onChange={(e) => setUrl(e.target.value)} />
            <Input label="Notes (optional)" placeholder="e.g. Up to ₹100 off dining" value={notes} onChange={(e) => setNotes(e.target.value)} />
            <div className="flex items-end">
              <Button type="submit" loading={saving}>Save discount</Button>
            </div>
          </form>
        </Card>
      ) : null}

      {discounts.length === 0 ? (
        <Card><p className="text-sm text-ink-600">No discounts yet. Add offers you want to track.</p></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {discounts.map((d) => (
            <Card key={d.id}>
              <div className="flex items-start justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                  <BadgePercent className="h-5 w-5" />
                </span>
                <button type="button" onClick={() => void remove(d.id)} className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-red-50 hover:text-red-600" aria-label={`Delete discount ${d.item}`}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <h3 className="mt-4 font-semibold text-ink-900">{d.item}</h3>
              <p className="mt-1 text-sm text-ink-600">{d.provider}</p>
              <p className="mt-2 font-display text-2xl font-bold text-violet-600">{d.discount}% off</p>
              {d.code ? <p className="mt-1 font-mono text-xs text-ink-500">Code: {d.code}</p> : null}
              {d.notes ? <p className="mt-2 text-xs text-ink-600">{d.notes}</p> : null}
              {d.url ? (
                <a href={d.url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-semibold text-primary-600 hover:text-primary-700">Visit offer →</a>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
