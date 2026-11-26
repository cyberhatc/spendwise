"use client";

import { useCallback, useEffect, useState } from "react";
import type { SavingsGoal } from "@/types";
import { DEMO_GOALS } from "@/lib/demo-data";
import { isDemoMode } from "@/lib/mode";

export function useGoals() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (isDemoMode()) {
        setGoals(DEMO_GOALS);
      } else {
        const res = await fetch("/api/goals");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Failed to load goals");
        setGoals(json.data ?? []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load goals");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const create = useCallback(
    async (input: { name: string; target_amount: number; saved_amount: number; deadline: string }) => {
      if (isDemoMode()) {
        const goal: SavingsGoal = { id: `demo_g_${Date.now()}`, user_id: "demo_user_spendwise", ...input, created_at: new Date().toISOString() };
        setGoals((prev) => [...prev, goal]);
        return goal;
      }
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, userId: "demo_user_spendwise" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to create goal");
      setGoals((prev) => [...prev, json.data]);
      return json.data;
    },
    []
  );

  const update = useCallback(
    async (id: string, patch: Partial<SavingsGoal>) => {
      if (isDemoMode()) {
        setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)));
        return;
      }
      const res = await fetch("/api/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...patch, userId: "demo_user_spendwise" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to update goal");
      setGoals((prev) => prev.map((g) => (g.id === id ? json.data : g)));
    },
    []
  );

  const remove = useCallback(async (id: string) => {
    if (isDemoMode()) {
      setGoals((prev) => prev.filter((g) => g.id !== id));
      return;
    }
    const res = await fetch(`/api/goals?id=${id}&userId=demo_user_spendwise`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Failed to delete goal");
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  return { goals, loading, error, reload: load, create, update, remove };
}
