"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { categoryMeta } from "@/lib/constants";
import { formatINR, formatINRCompact } from "@/lib/utils";
import type { CategoryTotal } from "@/lib/analytics";

interface CategoryPieChartProps {
  data: CategoryTotal[];
  type?: string;
  height?: number;
}

export function CategoryPieChart({ data, type = "expense", height = 280 }: CategoryPieChartProps) {
  const filtered = data.filter((d) => d.amount > 0);
  const total = filtered.reduce((a, b) => a + b.amount, 0);
  const colors = filtered.map((d) => categoryMeta(d.category).color);
  const centerLabel = type === "income" ? "Income" : "Spent";

  return (
    <div className="flex h-full flex-col items-center">
      <ResponsiveContainer width="100%" height={height * 0.72}>
        <PieChart>
          <Pie
            data={filtered}
            dataKey="amount"
            nameKey="category"
            innerRadius="58%"
            outerRadius="85%"
            paddingAngle={3}
            strokeWidth={0}
          >
            {filtered.map((entry, index) => (
              <Cell key={entry.category} fill={categoryMeta(entry.category).color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [formatINR(value), name]}
            contentStyle={{
              backgroundColor: "#171134",
              borderRadius: 12,
              border: "none",
              color: "#fff",
              fontSize: 13,
            }}
          />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="text-center">
        <p className="text-2xl font-bold text-ink-900">{formatINRCompact(total)}</p>
        <p className="text-xs font-medium text-ink-500">{centerLabel} by category</p>
      </div>
    </div>
  );
}
