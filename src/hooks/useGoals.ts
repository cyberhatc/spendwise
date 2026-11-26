"use client";

import { useCallback, useEffect, useState } from "react";
import type { SavingsGoal } from "@/types";
import { useAuth } from "@/context/AuthContext";

export function useGoals() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/goals");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load goals");
      setGoals(json.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load goals");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    void load();
  }, [authLoading, load]);

  const create = useCallback(
    async (input: { name: string; target_amount: number; saved_amount: number; deadline: string }) => {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
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
      const res = await fetch("/api/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...patch }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to update goal");
      setGoals((prev) => prev.map((g) => (g.id === id ? json.data : g)));
    },
    []
  );

  const remove = useCallback(async (id: string) => {
    const res = await fetch(`/api/goals?id=${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Failed to delete goal");
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  return { goals, loading, error, reload: load, create, update, remove };
}
