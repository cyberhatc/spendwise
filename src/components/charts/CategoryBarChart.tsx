"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatINRCompact } from "@/lib/utils";

export interface CategoryBarDatum {
  category: string;
  amount: number;
  color?: string;
}

interface CategoryBarChartProps {
  data: CategoryBarDatum[];
  height?: number;
}

export function CategoryBarChart({ data, height = 280 }: CategoryBarChartProps) {
  const sorted = [...data].sort((a, b) => b.amount - a.amount).slice(0, 8);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={sorted} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EFECF9" horizontal={false} />
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="category" width={110} tick={{ fontSize: 12, fill: "#4a448a" }} axisLine={false} tickLine={false} />
        <Tooltip
          formatter={(value: number, name: string) => [formatINRCompact(value), name]}
          contentStyle={{
            backgroundColor: "#171134",
            borderRadius: 12,
            border: "none",
            color: "#fff",
            fontSize: 13,
          }}
        />
        <Bar dataKey="amount" name="Amount" radius={[0, 6, 6, 0]} maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
}
