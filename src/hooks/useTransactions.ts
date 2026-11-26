"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Transaction, TransactionType } from "@/types";
import { useAuth } from "@/context/AuthContext";

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

const EMPTY: TransactionResult = { transactions: [], total: 0, page: 1, pageSize: 10, totalPages: 1 };

export function useTransactions(filters: TransactionFilters = {}) {
  const [result, setResult] = useState<TransactionResult>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.page) params.set("page", String(filters.page));
    if (filters.pageSize) params.set("pageSize", String(filters.pageSize));
    if (filters.search) params.set("search", filters.search);
    if (filters.category) params.set("category", filters.category);
    if (filters.type && filters.type !== "all") params.set("type", filters.type);
    if (filters.month) params.set("month", filters.month);
    return params.toString();
  }, [filters.page, filters.pageSize, filters.search, filters.category, filters.type, filters.month]);

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/transactions?${queryString}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load transactions");
      setResult(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [queryString, user]);

  useEffect(() => {
    if (authLoading) return;
    const t = setTimeout(() => void load(), 250);
    return () => clearTimeout(t);
  }, [authLoading, load]);

  const add = useCallback(
    async (input: Omit<Transaction, "id" | "user_id" | "created_at">) => {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to add transaction");
      await load();
      return json.data as Transaction;
    },
    [load]
  );

  const update = useCallback(
    async (id: string, patch: Partial<Transaction>) => {
      const res = await fetch("/api/transactions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...patch }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to update transaction");
      await load();
    },
    [load]
  );

  const remove = useCallback(
    async (id: string) => {
      if (!user) throw new Error("Not authenticated");
      const res = await fetch(`/api/transactions?id=${id}&userId=${user.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to delete transaction");
      await load();
    },
    [load, user]
  );

  return { ...result, loading, error, reload: load, add, update, remove };
}
