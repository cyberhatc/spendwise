"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { useTransactions } from "@/hooks/useTransactions";
import { useToast } from "@/components/ui/Toast";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/constants";
import { todayISO } from "@/lib/utils";
import type { Transaction, TransactionType } from "@/types";

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  /** When provided, the modal edits this transaction instead of creating one. */
  transaction?: Transaction | null;
  defaultType?: TransactionType;
  defaultAmount?: number;
}

export function TransactionModal({ open, onClose, transaction, defaultType = "expense", defaultAmount }: TransactionModalProps) {
  const router = useRouter();
  const { add, update, remove } = useTransactions();
  const { toast } = useToast();

  const isEdit = !!transaction;

  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [date, setDate] = useState<string>(todayISO());
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setFormError(null);
      if (transaction) {
        setType(transaction.type);
        setAmount(String(transaction.amount));
        setCategory(transaction.category);
        setDescription(transaction.description);
        setDate(transaction.date);
      } else {
        setType(defaultType);
        setAmount(defaultAmount ? String(defaultAmount) : "");
        setCategory(defaultType === "income" ? "Income" : "Food");
        setDescription("");
        setDate(todayISO());
      }
    }
  }, [open, transaction, defaultType, defaultAmount]);

  const categories = useMemo(
    () => (type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES),
    [type]
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setFormError("Enter an amount greater than 0.");
      return;
    }
    if (!category) {
      setFormError("Please choose a category.");
      return;
    }
    if (description.trim().length < 2) {
      setFormError("Please add a short description.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        type,
        amount: Math.round(value * 100) / 100,
        category,
        description: description.trim(),
        date,
      };
      if (transaction) {
        await update(transaction.id, payload);
        toast("Transaction updated");
      } else {
        await add(payload);
        toast("Expense added");
      }
      onClose();
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!transaction) return;
    await remove(transaction.id);
    toast("Transaction deleted", "info");
    onClose();
    router.refresh();
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit transaction" : "Add transaction"} description={isEdit ? "Update the details" : "Log a new expense or income"}>
      <form onSubmit={onSubmit} className="space-y-4">
        {formError ? <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{formError}</div> : null}
        {!isEdit && (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setType("expense");
                setCategory("Food");
              }}
              className={`h-12 rounded-xl border text-sm font-semibold transition-all ${
                type === "expense" ? "border-primary-500 bg-primary-50 text-primary-700" : "border-line bg-white text-ink-600 hover:border-primary-200"
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => {
                setType("income");
                setCategory("Income");
              }}
              className={`h-12 rounded-xl border text-sm font-semibold transition-all ${
                type === "income" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-line bg-white text-ink-600 hover:border-emerald-200"
              }`}
            >
              Income
            </button>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Amount"
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)} disabled={isEdit && !!transaction}>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
        </div>
        <Input
          label="Description"
          placeholder={type === "expense" ? "e.g. Lunch with friends" : "e.g. Stipend received"}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={saving} className="flex-1">
            {isEdit ? "Save changes" : type === "income" ? "Add income" : "Add expense"}
          </Button>
          {isEdit ? (
            <Button type="button" variant="danger" onClick={onDelete}>
              Delete
            </Button>
          ) : (
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
}
