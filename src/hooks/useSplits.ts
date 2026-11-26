"use client";

import { useCallback, useEffect, useState } from "react";
import type { ExpenseSplit } from "@/types";
import { DEMO_SPLITS } from "@/lib/demo-data";
import { isDemoMode } from "@/lib/mode";

export function useSplits() {
  const [splits, setSplits] = useState<ExpenseSplit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (isDemoMode()) {
        setSplits(DEMO_SPLITS);
      } else {
        const res = await fetch("/api/splits");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Failed to load splits");
        setSplits(json.data ?? []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load splits");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const create = useCallback(async (input: Omit<ExpenseSplit, "id" | "user_id" | "created_at">) => {
    if (isDemoMode()) {
      const split: ExpenseSplit = { ...input, id: `demo_s_${Date.now()}`, user_id: "demo_user_spendwise", created_at: new Date().toISOString() };
      setSplits((prev) => [split, ...prev]);
      return split;
    }
    const res = await fetch("/api/splits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...input, userId: "demo_user_spendwise" }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Failed to create split");
    setSplits((prev) => [json.data, ...prev]);
    return json.data;
  }, []);

  const settle = useCallback(async (id: string, status: "settled" | "pending") => {
    if (isDemoMode()) {
      setSplits((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
      return;
    }
    const res = await fetch("/api/splits", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, userId: "demo_user_spendwise" }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Failed to update split");
    setSplits((prev) => prev.map((s) => (s.id === id ? json.data : s)));
  }, []);

  const remove = useCallback(async (id: string) => {
    if (isDemoMode()) {
      setSplits((prev) => prev.filter((s) => s.id !== id));
      return;
    }
    const res = await fetch(`/api/splits?id=${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Failed to delete split");
    setSplits((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return { splits, loading, error, reload: load, create, settle, remove };
}
