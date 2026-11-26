"use client";

import { useCallback, useEffect, useState } from "react";
import type { Transaction, TransactionType } from "@/types";
import { buildDemoTransactions } from "@/lib/demo-data";
import { isDemoMode } from "@/lib/mode";
import { useDemoTransactionActions } from "@/hooks/useDemoActions";

export interface TransactionFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  type?: TransactionType | "all";
  month?: string;
}

export interface TransactionResult {
  transactions: Transaction[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function applyFilters(list: Transaction[], filters: TransactionFilters): TransactionResult {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;
  let out = [...list];
  if (filters.type && filters.type !== "all") out = out.filter((t) => t.type === filters.type);
  if (filters.category && filters.category !== "all") out = out.filter((t) => t.category === filters.category);
  if (filters.month && filters.month !== "all") out = out.filter((t) => (t.date ?? "").slice(0, 7) === filters.month);
  if (filters.search) {
    const q = filters.search.trim().toLowerCase();
    out = out.filter(
      (t) =>
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q)
    );
  }
  out.sort((a, b) => (b.date < a.date ? -1 : b.date > a.date ? 1 : b.created_at < a.created_at ? -1 : 1));
  const total = out.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  return { transactions: out.slice(start, start + pageSize), total, page: safePage, pageSize, totalPages };
}

export function useTransactions(filters: TransactionFilters = {}) {
  const [result, setResult] = useState<TransactionResult>({ transactions: [], total: 0, page: 1, pageSize: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const demoActions = useDemoTransactionActions();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (isDemoMode()) {
        const all = buildDemoTransactions();
        setResult(applyFilters(all, filters));
      } else {
        const params = new URLSearchParams();
        if (filters.page) params.set("page", String(filters.page));
        if (filters.pageSize) params.set("pageSize", String(filters.pageSize));
        if (filters.search) params.set("search", filters.search);
        if (filters.category) params.set("category", filters.category);
        if (filters.type && filters.type !== "all") params.set("type", filters.type);
        if (filters.month) params.set("month", filters.month);
        const res = await fetch(`/api/transactions?${params.toString()}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Failed to load transactions");
        setResult(json.data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(() => void load(), 250);
    return () => clearTimeout(t);
  }, [load]);

  const add = useCallback(
    async (input: Omit<Transaction, "id" | "user_id" | "created_at" | "is_demo">) => {
      if (isDemoMode()) {
        const t = demoActions.add(input);
        await new Promise((r) => setTimeout(r, 250));
        await load();
        return t;
      }
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, user_id: "demo_user_spendwise" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to add transaction");
      await load();
      return json.data as Transaction;
    },
    [demoActions, load]
  );

  const update = useCallback(
    async (id: string, patch: Partial<Transaction>) => {
      if (isDemoMode()) {
        demoActions.update(id, patch);
        await new Promise((r) => setTimeout(r, 200));
        await load();
        return;
      }
      const res = await fetch("/api/transactions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...patch }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to update transaction");
      await load();
    },
    [demoActions, load]
  );

  const remove = useCallback(
    async (id: string) => {
      if (isDemoMode()) {
        demoActions.remove(id);
        await new Promise((r) => setTimeout(r, 200));
        await load();
        return;
      }
      const res = await fetch(`/api/transactions?id=${id}&userId=demo_user_spendwise`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to delete transaction");
      await load();
    },
    [demoActions, load]
  );

  return { ...result, loading, error, reload: load, add, update, remove };
}
