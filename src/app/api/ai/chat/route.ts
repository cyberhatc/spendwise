import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";
import { buildDemoTransactions } from "@/lib/demo-data";
import { isDemoMode } from "@/lib/mode";
import { summarize } from "@/lib/analytics";
import { formatINR } from "@/lib/utils";

const FALLBACK_REPLY =
  "I couldn't reach the AI service right now. Based on your saved data, here is what I suggest: track every expense for a week, cook at home twice more this week, and set a monthly savings target of 20% of income. Open the AI Assistant once Gemini is configured for personalized insights.";

function demoReply(question: string, summary: { income: number; expenses: number; savings: number }): string {
  const q = question.toLowerCase();
  const topAdvice = "Try cooking at home for one meal a day and swapping one transport mode for walking or cycling this week.";
  if (q.includes("save") || q.includes("saving") || q.includes("budget")) {
    return `Great question! Based on your demo spending, a solid plan is: set a monthly savings target of ${formatINR(Math.round(summary.income * 0.2))} (20% of income), reduce Food & Dining by planning meals, and automate a ${formatINR(Math.round(summary.income * 0.1))} transfer to savings each month. ${topAdvice}`;
  }
  if (q.includes("where") || q.includes("category") || q.includes("spend")) {
    return `Your demo data shows Food & Dining as the biggest expense area. Tracking this category closely and limiting it to your monthly food budget could free up money for savings. ${topAdvice}`;
  }
  return `Here's a quick look at your demo finances — income ${formatINR(summary.income)}, expenses ${formatINR(summary.expenses)}, savings ${formatINR(summary.savings)}. For personalized advice, configure the Gemini API key. ${topAdvice}`;
}

export async function POST(req: Request) {
  const body = await req.json();
  const messages = Array.isArray(body?.messages) ? body.messages : [];
  const lastUser = [...messages].reverse().find((m: { role: string }) => m?.role === "user");
  const question = typeof lastUser?.content === "string" ? lastUser.content : "Give me my spending insights";

  const reply: { reply: string; aiGenerated: boolean } = { reply: FALLBACK_REPLY, aiGenerated: false };

  if (isDemoMode()) {
    const transactions = buildDemoTransactions();
    const summary = summarize(transactions);
    return NextResponse.json({ reply: demoReply(question, summary), aiGenerated: false });
  }

  const client = await createClient();
  const { data: userData } = await client.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let transactions: { type: string; amount: number; category: string; description: string; date: string }[] = [];
  const { data: txData, error } = await client
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(50);
  if (!error) {
    transactions = (txData ?? []).map((t) => ({
      type: t.type,
      amount: t.amount,
      category: t.category,
      description: t.description,
      date: t.date,
    }));
  }

  const summary = summarize(transactions as never);
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL ?? "gemini-1.5-flash" });
      const prompt = `You are SpendWise, a friendly financial coach for Indian college students. Answer the student's question using their spending data.
Transactions: ${transactions
        .slice(0, 30)
        .map((t) => `${t.type} ${t.amount} ${t.category} ${t.description} ${t.date}`)
        .join(", ")}
Summary: income=${summary.income}, expenses=${summary.expenses}, savings=${summary.savings}.
Question: ${question}
Provide a concise, practical, encouraging answer in under 150 words.`;
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (text) {
        reply.aiGenerated = true;
        reply.reply = text;
      }
    } catch (e) {
      console.warn("Gemini chat failed, using fallback", e);
    }
  }

  return NextResponse.json(reply);
}
