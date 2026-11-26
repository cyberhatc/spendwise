import type { Metadata } from "next";
import { LandingNav } from "@/components/layout/LandingNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { ArrowRight, Sparkles, Wallet, TrendingUp, ShieldCheck, Smartphone, BarChart3, PiggyBank, Users, CalendarCheck, GraduationCap } from "lucide-react";

export const metadata: Metadata = {
  title: "SpendWise — Track Smart. Spend Better. Save More.",
};

const FEATURES = [
  { icon: Wallet, title: "Expense Tracking", description: "Every rupee logged in seconds. Food, transport, shopping, entertainment — all categorized automatically." },
  { icon: BarChart3, title: "Spending Analytics", description: "Beautiful charts reveal where your money goes so you can make informed decisions." },
  { icon: PiggyBank, title: "Savings Goals", description: "Set targets, track progress, and build healthy savings habits month over month." },
  { icon: Sparkles, title: "AI Insights", description: "Gemini-powered coaching that finds patterns and suggests realistic savings." },
  { icon: Users, title: "Split Expenses", description: "Group trips and shared expenses with friends and settle up easily." },
  { icon: CalendarCheck, title: "No-Spend Challenges", description: "Build streaks around zero-spend weeks and keep lifestyle inflation in check." },
];

const STEPS = [
  { title: "Create your account", description: "Sign up in under a minute and set your monthly budget." },
  { title: "Add your expenses", description: "Log spending as it happens or import from bank history." },
  { title: "Save more", description: "AI insights and smart budgets help you spend better." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-lavender text-ink-900">
      <LandingNav />
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-primary-200/40 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-1.5 text-sm font-semibold text-primary-700 ring-1 ring-primary-100">
              <Sparkles className="h-4 w-4" /> AI-powered student finance
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.12] tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
              Track Smart. <span className="text-primary-500">Spend Better.</span> Save More.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-600">
              SpendWise is the beautiful expense tracker built for college students — with budgets, savings goals, analytics and AI coaching in one calm place.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary-500 px-6 font-semibold text-white shadow-soft transition-all hover:bg-primary-600">
                Start tracking free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/dashboard" className="inline-flex h-12 items-center justify-center rounded-xl border border-primary-200 bg-white px-6 font-semibold text-primary-700 transition-colors hover:bg-primary-50">
                Explore demo
              </Link>
            </div>
            <p className="mt-4 text-sm text-ink-500">Free forever for students · No credit card required</p>
          </div>
          {/* Hero visual */}
          <div className="relative animate-fade-up" style={{ animationDelay: "120ms" }}>
            <div className="rounded-3xl bg-white p-6 shadow-cardHover ring-1 ring-line sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink-500">Total balance</p>
                  <p className="font-display text-3xl font-bold text-ink-900">₹24,580</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">+12.4%</span>
              </div>
              <div className="mt-6 flex h-40 items-end gap-2">
                {[40, 65, 45, 80, 58, 90].map((h, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <div className="w-full rounded-t-lg bg-primary-100" style={{ height: `${h}%` }}>
                      <div className="w-full rounded-t-lg bg-primary-500" style={{ height: `${h * 0.6}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-ink-500">
                <span>Income</span><span>Expenses</span>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-4 hidden rounded-2xl bg-white p-4 shadow-cardHover ring-1 ring-line sm:block">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><TrendingUp className="h-5 w-5" /></span>
                <div>
                  <p className="text-sm font-semibold text-ink-900">Food &amp; Dining down 18%</p>
                  <p className="text-xs text-ink-500">vs last month</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="border-y border-line bg-white/60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-8 px-6 py-8 text-sm font-medium text-ink-500">
          <span>Trusted by 12,000+ students</span>
          <span className="text-line">•</span>
          <span>₹40 Cr tracked with SpendWise</span>
          <span className="text-line">•</span>
          <span>4.9/5 student rating</span>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold text-ink-900 sm:text-4xl">Everything you need to manage student money</h2>
          <p className="mt-4 text-lg text-ink-600">From first paycheck to final semester, SpendWise keeps your finances clear, calm and under control.</p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.title} className="transition-shadow duration-300 hover:shadow-cardHover">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-semibold text-ink-900">{f.title}</h3>
                <p className="mt-2 text-sm text-ink-600">{f.description}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white/60 py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-3xl font-bold text-center text-ink-900">How it works</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.title} className="relative rounded-2xl bg-white p-8 text-center shadow-card ring-1 ring-line">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-500 font-display text-lg font-bold text-white">{(i + 1).toString()}</span>
                <h3 className="mt-5 font-semibold text-ink-900">{s.title}</h3>
                <p className="mt-2 text-sm text-ink-600">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-4 py-1.5 text-sm font-semibold text-violet-600 ring-1 ring-violet-100">
              <GraduationCap className="h-4 w-4" /> Built for students
            </span>
            <h2 className="mt-6 font-display text-3xl font-bold text-ink-900 sm:text-4xl">Your finances, finally under control</h2>
            <p className="mt-4 text-lg text-ink-600">Students juggle fees, rent, food and fun. SpendWise helps you see the full picture and make smarter choices without the money stress.</p>
            <ul className="mt-6 space-y-3">
              {["Budgets that warn you before you overspend", "Savings goals with real deadlines", "AI coaching tuned for student life", "Student discounts, tracked for you"].map((b) => (
                <li key={b} className="flex items-center gap-3 text-sm font-medium text-ink-800">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><ShieldCheck className="h-4 w-4" /></span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <Card className="p-8">
            <div className="flex items-center gap-3">
              <Smartphone className="h-6 w-6 text-primary-500" />
              <h3 className="font-semibold text-ink-900">Works everywhere you study</h3>
            </div>
            <p className="mt-3 text-sm text-ink-600">Phone, tablet or laptop — SpendWise adapts to your rhythm, whether you&apos;re at the hostel canteen or at the library.</p>
            <div className="mt-6 rounded-2xl bg-lavender p-5">
              <p className="text-sm font-semibold text-ink-800">This month so far</p>
              <p className="mt-2 font-display text-2xl font-bold text-ink-900">₹18,240</p>
              <p className="mt-1 text-xs text-ink-500">across 6 categories</p>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-ink-900 px-8 py-16 text-center shadow-cardHover sm:px-16">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[30rem] -translate-x-1/2 rounded-full bg-primary-600/30 blur-3xl" />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">Ready to take control of your money?</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/70">Join thousands of students who track smarter and save better with SpendWise.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/signup" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary-500 px-6 font-semibold text-white shadow-soft transition-all hover:bg-primary-600">
                Create free account <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/login" className="inline-flex h-12 items-center justify-center rounded-xl border border-white/30 px-6 font-semibold text-white transition-colors hover:bg-white/10">
                Log in
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
