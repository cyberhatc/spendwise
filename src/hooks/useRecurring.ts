"use client";

import { useCallback, useEffect, useState } from "react";
import type { RecurringTransaction } from "@/types";
import { useAuth } from "@/context/AuthContext";

export function useRecurring() {
  const [items, setItems] = useState<RecurringTransaction[]>([]);
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
      const res = await fetch("/api/recurring");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load recurring");
      setItems(json.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load recurring");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    void load();
  }, [authLoading, load]);

  const create = useCallback(
    async (input: Omit<RecurringTransaction, "id" | "user_id" | "created_at">) => {
      const res = await fetch("/api/recurring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to create recurring");
      setItems((prev) => [...prev, json.data]);
      return json.data;
    },
    []
  );

  const remove = useCallback(async (id: string) => {
    const res = await fetch(`/api/recurring?id=${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Failed to delete recurring");
    setItems((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return { items, loading, error, reload: load, create, remove };
}
