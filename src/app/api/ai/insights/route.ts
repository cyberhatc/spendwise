import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";
import { categoryBreakdown, monthlySeries, summarize } from "@/lib/analytics";
import { formatINR } from "@/lib/utils";
import type { Transaction } from "@/types";

export interface Insight {
  id: string;
  title: string;
  description: string;
  type: "saving" | "warning" | "pattern" | "income";
  impact?: number;
}

function localInsights(transactions: Transaction[]): Insight[] {
  const summary = summarize(transactions);
  const breakdown = categoryBreakdown(transactions, "expense");
  const series = monthlySeries(transactions, 3);
  const insights: Insight[] = [];
  if (summary.income > 0) {
    insights.push({
      id: "rate",
      title: "Savings rate",
      description: `You saved ${formatINR(summary.savings)} of your ${formatINR(summary.income)} income. Aim for at least 20%.`,
      type: "saving",
      impact: summary.income > 0 ? Math.round((summary.savings / summary.income) * 100) : 0,
    });
  }
  const top = breakdown[0];
  if (top) {
    insights.push({
      id: "top",
      title: top.category,
      description: `${top.category} is your top spending category at ${formatINR(top.amount)} (${top.percentage.toFixed(0)}% of expenses).`,
      type: "pattern",
    });
  }
  if (series.length >= 2) {
    const prev = series[1];
    const curr = series[2];
    if (prev.expenses > 0 && curr.expenses > 0) {
      const change = ((curr.expenses - prev.expenses) / prev.expenses) * 100;
      if (Math.abs(change) > 5) {
        insights.push({
          id: "trend",
          title: change > 0 ? "Spending is trending up" : "Spending is trending down",
          description: `Expenses ${change > 0 ? "rose" : "fell"} ${Math.abs(change).toFixed(0)}% between ${prev.label} and ${curr.label}.`,
          type: "pattern",
        });
      }
    }
  }
  insights.push({
    id: "month",
    title: "Monthly spend",
    description: `You spent ${formatINR(summary.expenses)} in the current month. Review the budget page for category limits.`,
    type: "warning",
  });
  return insights;
}

export async function GET() {
  const client = await createClient();
  const { data: userData } = await client.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let transactions: Transaction[] = [];
  const { data: txData, error } = await client
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false });
  if (!error) transactions = (txData ?? []) as Transaction[];

  const summary = summarize(transactions);
  const breakdown = categoryBreakdown(transactions, "expense");
  const series = monthlySeries(transactions, 3);

  const insights: Insight[] = localInsights(transactions);

  const apiKey = process.env.GEMINI_API_KEY;
  let aiGenerated = false;
  let aiText: string | null = null;
  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL ?? "gemini-1.5-flash" });
      const prompt = `You are SpendWise, a friendly financial coach for Indian college students. Analyze this student's spending and return 3-5 concise insights.
Transactions (recent): ${transactions
        .slice(0, 40)
        .map((t) => `${t.type} ${t.amount} ${t.category} ${t.description} ${t.date}`)
        .join(", ")}
Summary: income=${summary.income}, expenses=${summary.expenses}, savings=${summary.savings}.
Top categories: ${breakdown.slice(0, 5).map((b) => `${b.category}=${b.amount} (${b.percentage.toFixed(0)}%)`).join(", ")}.
Return a short list of actionable insight strings.`;
      const result = await model.generateContent(prompt);
      aiText = result.response.text();
      aiGenerated = true;
    } catch (e) {
      console.warn("Gemini insights failed, using local fallback", e);
    }
  }

  const insightsOut: Insight[] = aiText ? insights : insights;
  return NextResponse.json({ insights: insightsOut, aiGenerated, source: aiText ? "gemini" : "local", aiText, summary });
}
