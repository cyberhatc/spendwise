"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatINR, formatDisplayDateShort, formatINRCompact } from "@/lib/utils";
import { useTransactions, type TransactionFilters, type TransactionResult } from "@/hooks/useTransactions";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { TransactionModal } from "@/components/transactions/TransactionModal";
import { categoryMeta } from "@/lib/constants";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2, Search } from "lucide-react";
import type { Transaction } from "@/types";

export default function TransactionsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [filters, setFilters] = useState<TransactionFilters>({ page: 1, pageSize: 10 });

  const { transactions, total, page, pageSize, totalPages, loading, error, reload, add, update, remove } = useTransactions(filters);

  const [searchInput, setSearchInput] = useState("");
  const [type, setType] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [month, setMonth] = useState<string>("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setFilters((f) => ({ ...f, page: 1, search: searchInput.trim() || undefined, type: type === "all" ? "all" : (type as "income" | "expense"), category: category === "all" ? "all" : category, month: month === "all" ? "all" : month })), 300);
    return () => clearTimeout(t);
  }, [searchInput, type, category, month]);

  const setPage = (p: number) => setFilters((f) => ({ ...f, page: Math.max(1, p) }));

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (t: Transaction) => {
    setEditing(t);
    setModalOpen(true);
  };

  const onDelete = async () => {
    if (!deleting) return;
    await remove(deleting.id);
    toast("Transaction deleted", "info");
    setDeleting(null);
    router.refresh();
  };

  const result: TransactionResult = { transactions, total, page, pageSize, totalPages };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">Transactions</h1>
          <p className="mt-1 text-sm text-ink-600">{total} transactions</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add transaction
        </Button>
      </div>

      <Card>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
            <Input
              placeholder="Search description…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
              aria-label="Search transactions"
            />
          </div>
          <Select label="Type" value={type} onChange={(e) => setType(e.target.value)} aria-label="Filter by type">
            <option value="all">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </Select>
          <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category">
            <option value="all">All categories</option>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
            <option value="Income">Income</option>
          </Select>
          <Input
            label="Month"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full"
            aria-label="Filter by month"
          />
        </div>
      </Card>

      <Card className="p-0">
        {loading ? (
          <div className="space-y-4 p-6">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-12 w-48" />
                <Skeleton className="h-12 w-24" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-6 text-sm font-medium text-red-600">{error}</div>
        ) : result.transactions.length === 0 ? (
          <EmptyState
            title="No transactions found"
            description="Try adjusting your filters, or add a new transaction."
            action={
              <Button size="sm" onClick={openAdd}>
                <Plus className="h-4 w-4" /> Add transaction
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-mist">
            {result.transactions.map((t) => {
              const meta = categoryMeta(t.category);
              const Icon = meta.icon;
              const isIncome = t.type === "income";
              return (
                <li key={t.id} className="flex items-center gap-3 p-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" style={{ backgroundColor: `${meta.color}1A`, color: meta.color }}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink-900">{t.description}</p>
                    <p className="text-xs text-ink-500">
                      {meta.label} · {formatDisplayDateShort(t.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${isIncome ? "text-emerald-600" : "text-ink-900"}`}>
                      {isIncome ? "+" : "-"}{formatINRCompact(t.amount)}
                    </p>
                    <p className="text-xs font-medium text-ink-500">{formatINR(t.amount)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => openEdit(t)} className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-mist hover:text-primary-600" aria-label={`Edit ${t.description}`}>
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => setDeleting(t)} className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-red-50 hover:text-red-600" aria-label={`Delete ${t.description}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* Pagination */}
      {!loading && !error && totalPages > 1 ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink-600">
            Page {page} of {totalPages} · {total} total
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}

      <TransactionModal open={modalOpen} onClose={() => setModalOpen(false)} transaction={editing} />

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete transaction" description="This action cannot be undone." size="sm">
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleting(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
