"use client";

import { useCallback, useEffect, useState } from "react";
import type { Budget } from "@/types";
import { useAuth } from "@/context/AuthContext";

export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
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
      const res = await fetch("/api/budgets");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load budgets");
      setBudgets(json.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load budgets");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    void load();
  }, [authLoading, load]);

  const save = useCallback(
    async (input: { id?: string; category: string; monthly_limit: number }) => {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to save budget");
      await load();
    },
    [load]
  );

  return { budgets, loading, error, reload: load, save };
}
