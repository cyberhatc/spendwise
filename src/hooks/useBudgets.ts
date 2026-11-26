"use client";

import { useCallback, useEffect, useState } from "react";
import type { Budget } from "@/types";
import { DEMO_BUDGETS } from "@/lib/demo-data";
import { isDemoMode } from "@/lib/mode";

export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (isDemoMode()) {
        setBudgets(DEMO_BUDGETS as unknown as Budget[]);
      } else {
        const res = await fetch("/api/budgets");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Failed to load budgets");
        setBudgets(json.data ?? []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load budgets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(
    async (input: { id?: string; category: string; monthly_limit: number }) => {
      if (isDemoMode()) {
        const existing = DEMO_BUDGETS.find((b) => b.category === input.category);
        if (existing) {
          setBudgets((DEMO_BUDGETS as unknown as Budget[]).map((b) => (b.category === input.category ? { ...b, monthly_limit: input.monthly_limit } : b)));
        } else {
          setBudgets([...(DEMO_BUDGETS as unknown as Budget[]), { id: `demo_b_${Date.now()}`, user_id: "demo_user_spendwise", category: input.category, monthly_limit: input.monthly_limit, created_at: new Date().toISOString() }]);
        }
        return;
      }
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, userId: "demo_user_spendwise" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to save budget");
      await load();
    },
    [load]
  );

  return { budgets, loading, error, reload: load, save };
}
