"use client";

import React from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatINRCompact } from "@/lib/utils";

export interface IncomeExpensePoint {
  label: string;
  income: number;
  expenses: number;
}

interface IncomeExpenseChartProps {
  data: IncomeExpensePoint[];
  height?: number;
}

export function IncomeExpenseChart({ data, height = 280 }: IncomeExpenseChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EFECF9" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#6b639f" }} axisLine={false} tickLine={false} />
        <YAxis
          tickFormatter={(v: number) => formatINRCompact(v)}
          tick={{ fontSize: 12, fill: "#6b639f" }}
          axisLine={false}
          tickLine={false}
          width={64}
        />
        <Tooltip
          formatter={(value: number, name: string) => [
            formatINRCompact(value),
            name === "income" ? "Income" : "Expenses",
          ]}
          contentStyle={{
            backgroundColor: "#171134",
            borderRadius: 12,
            border: "none",
            color: "#fff",
            fontSize: 13,
          }}
          labelStyle={{ color: "#e9e5ff" }}
        />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        <Bar dataKey="income" name="income" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={40} />
        <Bar dataKey="expenses" name="expenses" fill="#6C63FF" radius={[6, 6, 0, 0]} maxBarSize={40} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
