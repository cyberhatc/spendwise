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
import type { MonthlyPoint } from "@/lib/analytics";

export interface SpendingChartProps {
  data: MonthlyPoint[];
  height?: number;
}

export function SpendingChart({ data, height = 280 }: SpendingChartProps) {
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
            name === "expenses" ? "Expenses" : name === "income" ? "Income" : "Savings",
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
        <Bar dataKey="income" name="income" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={42} />
        <Bar dataKey="expenses" name="expenses" fill="#6C63FF" radius={[6, 6, 0, 0]} maxBarSize={42} />
        <Line type="monotone" dataKey="savings" name="savings" stroke="#F59E0B" strokeWidth={2.5} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
