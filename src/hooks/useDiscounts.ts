"use client";

import { useCallback, useEffect, useState } from "react";
import type { StudentDiscount } from "@/types";
import { useAuth } from "@/context/AuthContext";

export function useDiscounts() {
  const [discounts, setDiscounts] = useState<StudentDiscount[]>([]);
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
      const res = await fetch("/api/discounts");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load discounts");
      setDiscounts(json.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load discounts");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    void load();
  }, [authLoading, load]);

  const create = useCallback(async (input: Omit<StudentDiscount, "id" | "user_id" | "created_at">) => {
    const res = await fetch("/api/discounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Failed to save discount");
    setDiscounts(json.data ?? []);
    return json.data?.[0] as StudentDiscount;
  }, []);

  const remove = useCallback(async (id: string) => {
    const res = await fetch(`/api/discounts?id=${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Failed to delete discount");
    setDiscounts((prev) => prev.filter((d) => d.id !== id));
  }, []);

  return { discounts, loading, error, reload: load, create, remove };
}
