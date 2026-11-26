"use client";

import { useCallback, useEffect, useState } from "react";
import type { NoSpendChallenge } from "@/types";
import { DEMO_CHALLENGES } from "@/lib/demo-data";
import { isDemoMode } from "@/lib/mode";

export function useChallenges() {
  const [challenges, setChallenges] = useState<NoSpendChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (isDemoMode()) {
        setChallenges(DEMO_CHALLENGES);
      } else {
        const res = await fetch("/api/challenges");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Failed to load challenges");
        setChallenges(json.data ?? []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load challenges");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const create = useCallback(
    async (input: { title: string; target_spend: number; start_date: string; end_date: string }) => {
      if (isDemoMode()) {
        const challenge: NoSpendChallenge = {
          id: `demo_c_${Date.now()}`,
          user_id: "demo_user_spendwise",
          ...input,
          spent_amount: 0,
          is_active: true,
          created_at: new Date().toISOString(),
        };
        setChallenges((prev) => [...prev, challenge]);
        return challenge;
      }
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, userId: "demo_user_spendwise" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to create challenge");
      setChallenges((prev) => [...prev, json.data]);
      return json.data;
    },
    []
  );

  const update = useCallback(async (id: string, patch: Partial<NoSpendChallenge>) => {
    if (isDemoMode()) {
      setChallenges((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
      return;
    }
    const res = await fetch("/api/challenges", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch, userId: "demo_user_spendwise" }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Failed to update challenge");
    setChallenges((prev) => prev.map((c) => (c.id === id ? json.data : c)));
  }, []);

  const remove = useCallback(async (id: string) => {
    if (isDemoMode()) {
      setChallenges((prev) => prev.filter((c) => c.id !== id));
      return;
    }
    const res = await fetch(`/api/challenges?id=${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Failed to delete challenge");
    setChallenges((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return { challenges, loading, error, reload: load, create, update, remove };
}
