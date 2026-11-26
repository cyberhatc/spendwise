"use client";

import { useCallback, useEffect, useState } from "react";
import type { ExpenseSplit } from "@/types";
import { useAuth } from "@/context/AuthContext";

export function useSplits() {
  const [splits, setSplits] = useState<ExpenseSplit[]>([]);
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
      const res = await fetch("/api/splits");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load splits");
      setSplits(json.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load splits");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    void load();
  }, [authLoading, load]);

  const create = useCallback(async (input: Omit<ExpenseSplit, "id" | "user_id" | "created_at">) => {
    const res = await fetch("/api/splits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Failed to create split");
    setSplits((prev) => [json.data, ...prev]);
    return json.data;
  }, []);

  const settle = useCallback(async (id: string, status: "settled" | "pending") => {
    const res = await fetch("/api/splits", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Failed to update split");
    setSplits((prev) => prev.map((s) => (s.id === id ? json.data : s)));
  }, []);

  const remove = useCallback(async (id: string) => {
    const res = await fetch(`/api/splits?id=${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Failed to delete split");
    setSplits((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return { splits, loading, error, reload: load, create, settle, remove };
}
