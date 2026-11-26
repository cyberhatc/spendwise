"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, RefreshCw, Lightbulb, AlertTriangle, TrendingUp, DollarSign, Bot } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CardSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { formatINR } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

interface Insight {
  id: string;
  title: string;
  description: string;
  type: "saving" | "warning" | "pattern" | "income";
  impact?: number;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "Where am I overspending?",
  "How can I save more money?",
  "What's my spending trend this month?",
];

export default function AIAssistantPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [summary, setSummary] = useState<{ income: number; expenses: number; savings: number; balance: number } | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hi! I'm your SpendWise AI coach 👋 Ask me about your spending patterns, savings ideas, or anything money-related." },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadInsights = async () => {
    setInsightsLoading(true);
    try {
      const res = await fetch("/api/ai/insights");
      const json = await res.json();
      setInsights(json.insights ?? []);
      setAiGenerated(!!json.aiGenerated);
      setSummary(json.summary ?? null);
    } catch {
      setInsights([]);
      setAiGenerated(false);
    } finally {
      setInsightsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) void loadInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const question = input.trim();
    if (!question || sending) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: question }];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const json = await res.json();
      const reply: string = json.reply ?? json.replyText ?? "Sorry, I could not respond right now.";
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Sorry, I could not respond right now. Please try again in a moment." }]);
    } finally {
      setSending(false);
    }
  };

  const insightIcon = (type: Insight["type"]) => {
    switch (type) {
      case "saving": return <PiggyIcon />;
      case "warning": return <AlertTriangle className="h-5 w-5" />;
      case "pattern": return <TrendingUp className="h-5 w-5" />;
      default: return <DollarSign className="h-5 w-5" />;
    }
  };

  function PiggyIcon() {
    return <Sparkles className="h-5 w-5" />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-1">
        <Card>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-semibold text-ink-900">AI insights</h2>
              <p className="text-xs text-ink-500">Powered by Gemini</p>
            </div>
          </div>
          {insightsLoading ? <div className="mt-4 space-y-3">{[0, 1, 2].map((i) => <CardSkeleton key={i} className="h-24" />)}</div> : (
            <ul className="mt-4 space-y-3">
              {insights.map((ins) => (
                <li key={ins.id} className="rounded-2xl bg-surface p-4 ring-1 ring-line">
                  <div className="flex items-start gap-3">
                    <span className="text-primary-600">{insightIcon(ins.type)}</span>
                    <div>
                      <p className="text-sm font-semibold text-ink-900">{ins.title}</p>
                      <p className="mt-1 text-sm text-ink-600">{ins.description}</p>
                      {typeof ins.impact === "number" ? (
                        <p className="mt-1 text-xs font-semibold text-primary-700">Savings rate: {ins.impact.toFixed(0)}%</p>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
              {insights.length === 0 ? <p className="text-sm text-ink-500">No insights available yet.</p> : null}
            </ul>
          )}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-ink-500">Source: {aiGenerated ? "Gemini AI" : "Local analysis (AI not configured)"}</p>
            <Button variant="outline" size="sm" onClick={() => void loadInsights()}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          </div>
          {summary ? (
            <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-lavender p-4">
              <div>
                <p className="text-xs text-ink-500">Income</p>
                <p className="font-bold text-ink-900">{formatINR(summary.income)}</p>
              </div>
              <div>
                <p className="text-xs text-ink-500">Spent</p>
                <p className="font-bold text-ink-900">{formatINR(summary.expenses)}</p>
              </div>
            </div>
          ) : null}
        </Card>
      </div>

      <Card className="flex min-h-[480px] flex-col lg:col-span-2">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-ink-900">Chat with your AI coach</h2>
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <Bot className="h-4 w-4" /> Online
          </span>
        </div>
        <div className="mt-4 flex flex-1 flex-col gap-3 overflow-y-auto rounded-2xl bg-surface p-4 ring-1 ring-line" style={{ maxHeight: 420 }}>
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${m.role === "user" ? "bg-primary-500 text-white" : "bg-white text-ink-900 ring-1 ring-line"}`}>
                {m.content}
              </div>
            </div>
          ))}
          {sending ? (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-white px-4 py-3 text-sm text-ink-500 ring-1 ring-line">Thinking…</div>
            </div>
          ) : null}
          <div ref={bottomRef} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button key={q} type="button" onClick={() => { setInput(q); }} className="rounded-full bg-primary-50 px-4 py-2 text-xs font-semibold text-primary-700 hover:bg-primary-100">
              {q}
            </button>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") void send(); }}
            placeholder="Ask about your spending…"
            className="h-12 flex-1 rounded-xl border border-line bg-white px-4 text-sm text-ink-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            aria-label="Ask about your spending"
          />
          <Button onClick={() => void send()} loading={sending}>
            Send
          </Button>
        </div>
      </Card>
    </div>
  );
}
