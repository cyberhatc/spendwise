"use client";

import { useCallback, useEffect, useState } from "react";
import type { StudentDiscount } from "@/types";
import { DEMO_DISCOUNTS } from "@/lib/demo-data";
import { isDemoMode } from "@/lib/mode";

export function useDiscounts() {
  const [discounts, setDiscounts] = useState<StudentDiscount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (isDemoMode()) {
        setDiscounts(DEMO_DISCOUNTS);
      } else {
        const res = await fetch("/api/discounts");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Failed to load discounts");
        setDiscounts(json.data ?? []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load discounts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const create = useCallback(async (input: Omit<StudentDiscount, "id" | "user_id" | "created_at">) => {
    if (isDemoMode()) {
      const discount: StudentDiscount = { ...input, id: `demo_d_${Date.now()}`, user_id: "demo_user_spendwise" };
      setDiscounts((prev) => [...prev, discount]);
      return discount;
    }
    const res = await fetch("/api/discounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...input, userId: "demo_user_spendwise" }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Failed to save discount");
    setDiscounts((prev) => [json.data, ...prev]);
    return json.data;
  }, []);

  const remove = useCallback(async (id: string) => {
    if (isDemoMode()) {
      setDiscounts((prev) => prev.filter((d) => d.id !== id));
      return;
    }
    const res = await fetch(`/api/discounts?id=${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Failed to delete discount");
    setDiscounts((prev) => prev.filter((d) => d.id !== id));
  }, []);

  return { discounts, loading, error, reload: load, create, remove };
}
