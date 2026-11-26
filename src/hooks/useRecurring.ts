"use client";

import { useCallback, useEffect, useState } from "react";
import type { RecurringTransaction } from "@/types";
import { DEMO_RECURRING } from "@/lib/demo-data";
import { isDemoMode } from "@/lib/mode";

export function useRecurring() {
  const [items, setItems] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (isDemoMode()) {
        setItems(DEMO_RECURRING);
      } else {
        const res = await fetch("/api/recurring");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Failed to load recurring");
        setItems(json.data ?? []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load recurring");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const create = useCallback(
    async (input: Omit<RecurringTransaction, "id" | "user_id" | "created_at">) => {
      if (isDemoMode()) {
        const item: RecurringTransaction = { ...input, id: `demo_r_${Date.now()}`, user_id: "demo_user_spendwise", created_at: new Date().toISOString() };
        setItems((prev) => [...prev, item]);
        return item;
      }
      const res = await fetch("/api/recurring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, userId: "demo_user_spendwise" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to create recurring");
      setItems((prev) => [...prev, json.data]);
      return json.data;
    },
    []
  );

  const remove = useCallback(async (id: string) => {
    if (isDemoMode()) {
      setItems((prev) => prev.filter((r) => r.id !== id));
      return;
    }
    const res = await fetch(`/api/recurring?id=${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Failed to delete recurring");
    setItems((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return { items, loading, error, reload: load, create, remove };
}
