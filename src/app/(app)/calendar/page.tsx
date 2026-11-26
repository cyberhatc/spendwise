"use client";

import React, { useMemo, useState } from "react";
import { formatINR, formatDisplayDateShort, toISODate, formatINRCompact } from "@/lib/utils";
import { useTransactions } from "@/hooks/useTransactions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CalendarPage() {
  const { transactions, loading } = useTransactions({ pageSize: 1000 });
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState<string>(toISODate(new Date()));

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay(); // 0 Sun
  const monthName = new Date(viewYear, viewMonth, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  const dailyMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of transactions) {
      if (t.type !== "expense") continue;
      const key = t.date;
      if (!key) continue;
      map.set(key, (map.get(key) ?? 0) + t.amount);
    }
    return map;
  }, [transactions]);

  const dayKeys: string[] = useMemo(() => {
    const keys: string[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      keys.push(key);
    }
    return keys;
  }, [viewYear, viewMonth, daysInMonth]);

  const prevMonth = () => {
    const d = new Date(viewYear, viewMonth, 1);
    d.setMonth(d.getMonth() - 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };
  const nextMonth = () => {
    const d = new Date(viewYear, viewMonth, 1);
    d.setMonth(d.getMonth() + 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const selectedTx = useMemo(
    () => transactions.filter((t) => t.date === selected).sort((a, b) => (b.date < a.date ? -1 : 1)),
    [transactions, selected]
  );

  const shiftMonth = (delta: number) => {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const cells: React.ReactNode[] = [];
  for (let i = 0; i < firstWeekday; i++) {
    const d = new Date(viewYear, viewMonth, 1 - (firstWeekday - i)).getDate();
    cells.push(
      <div key={`pre-${i}`} className="min-h-[72px] rounded-xl bg-mist/50 lg:min-h-[96px]" />
    );
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const total = dailyMap.get(key) ?? 0;
    const isSelected = key === selected;
    cells.push(
      <button
        key={key}
        type="button"
        onClick={() => setSelected(key)}
        className={`min-h-[72px] rounded-xl border p-1.5 text-left transition-all lg:min-h-[96px] ${
          isSelected ? "border-primary-400 bg-primary-50" : "border-line bg-white hover:border-primary-200"
        }`}
        aria-label={`Day ${d}, spending ${formatINR(total)}`}
      >
        <span className="block text-xs font-semibold text-ink-700">{d}</span>
        <span className={`block text-[10px] font-medium ${total > 0 ? "text-ink-600" : "text-ink-400"}`}>
          {total > 0 ? formatINRCompact(total) : "—"}
        </span>
      </button>
    );
  }
  while (cells.length % 7 !== 0) {
    cells.push(
      <div key={`post-${cells.length}`} className="min-h-[72px] rounded-xl bg-mist/50 lg:min-h-[96px]" />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">Expense calendar</h1>
          <p className="mt-1 text-sm text-ink-600">{monthName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={prevMonth} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={nextMonth} aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <CardSkeleton className="h-80" />
      ) : (
        <Card className="p-4">
          <div className="grid grid-cols-7 gap-1.5">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="px-2 py-2 text-center text-xs font-semibold text-ink-500">
                {d}
              </div>
            ))}
            {cells}
          </div>
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-ink-900">{formatDisplayDateShort(selected)}</h2>
            <p className="text-sm text-ink-500">{selectedTx.length} transactions</p>
          </div>
        </div>
        {selectedTx.length === 0 ? (
          <p className="mt-4 text-sm text-ink-500">No transactions recorded for this day.</p>
        ) : (
          <ul className="mt-3 divide-y divide-mist">
            {selectedTx.map((t) => (
              <li key={t.id} className="flex items-center justify-between py-2.5">
                <span className="text-sm font-medium text-ink-800">{t.description}</span>
                <span className={`text-sm font-bold ${t.type === "income" ? "text-emerald-600" : "text-ink-900"}`}>
                  {t.type === "income" ? "+" : "-"}{formatINR(t.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
