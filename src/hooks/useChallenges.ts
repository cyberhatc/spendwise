"use client";

import { useCallback, useEffect, useState } from "react";
import type { NoSpendChallenge } from "@/types";
import { useAuth } from "@/context/AuthContext";

export function useChallenges() {
  const [challenges, setChallenges] = useState<NoSpendChallenge[]>([]);
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
      const res = await fetch("/api/challenges");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load challenges");
      setChallenges(json.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load challenges");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    void load();
  }, [authLoading, load]);

  const create = useCallback(
    async (input: { title: string; target_spend: number; start_date: string; end_date: string }) => {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to create challenge");
      setChallenges((prev) => [...prev, json.data]);
      return json.data;
    },
    []
  );

  const update = useCallback(async (id: string, patch: Partial<NoSpendChallenge>) => {
    const res = await fetch("/api/challenges", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Failed to update challenge");
    setChallenges((prev) => prev.map((c) => (c.id === id ? json.data : c)));
  }, []);

  const remove = useCallback(async (id: string) => {
    const res = await fetch(`/api/challenges?id=${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Failed to delete challenge");
    setChallenges((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return { challenges, loading, error, reload: load, create, update, remove };
}
