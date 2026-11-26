import { useCallback } from "react";
import type { Transaction } from "@/types";
import { buildDemoTransactions } from "@/lib/demo-data";

const DEMO_KEY = "spendwise_demo_transactions_v1";

function loadDemo(): Transaction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(DEMO_KEY);
    if (raw) return JSON.parse(raw) as Transaction[];
  } catch {
    /* ignore */
  }
  const seeded = buildDemoTransactions();
  try {
    window.localStorage.setItem(DEMO_KEY, JSON.stringify(seeded));
  } catch {
    /* ignore */
  }
  return seeded;
}

function persistDemo(list: Transaction[]) {
  try {
    window.localStorage.setItem(DEMO_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export function useDemoTransactionActions() {
  const add = useCallback((input: Omit<Transaction, "id" | "user_id" | "created_at" | "is_demo">) => {
    const list = loadDemo();
    const t: Transaction = {
      ...input,
      id: `demo_txn_${Date.now().toString(36)}`,
      user_id: "demo_user_spendwise",
      created_at: new Date().toISOString(),
      is_demo: true,
    };
    const next = [t, ...list];
    persistDemo(next);
    window.dispatchEvent(new Event("spendwise:demo-updated"));
    return t;
  }, []);

  const update = useCallback((id: string, patch: Partial<Transaction>) => {
    const list = loadDemo().map((t) =>
      t.id === id ? { ...t, ...patch, id, user_id: t.user_id, created_at: t.created_at } : t
    );
    persistDemo(list);
    window.dispatchEvent(new Event("spendwise:demo-updated"));
  }, []);

  const remove = useCallback((id: string) => {
    persistDemo(loadDemo().filter((t) => t.id !== id));
    window.dispatchEvent(new Event("spendwise:demo-updated"));
  }, []);

  const reset = useCallback(() => {
    persistDemo(buildDemoTransactions());
    window.dispatchEvent(new Event("spendwise:demo-updated"));
  }, []);

  return { add, update, remove, reset };
}
