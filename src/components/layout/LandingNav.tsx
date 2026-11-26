"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Menu, X, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/transactions", label: "Transactions" },
  { href: "/budgets", label: "Budgets" },
  { href: "/savings", label: "Savings" },
  { href: "/analytics", label: "Analytics" },
];

export function LandingNav() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 border-b border-line/60 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500 text-white shadow-soft">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-bold text-ink-900">SpendWise</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Landing">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-ink-700 transition-colors hover:text-primary-600">
              {item.label}
            </Link>
          ))}
          <Link href="/ai" className="text-sm font-medium text-ink-700 transition-colors hover:text-primary-600">AI</Link>
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" className="text-sm font-semibold text-ink-700 hover:text-primary-600">Log in</Link>
          <Link href="/signup" className="inline-flex h-10 items-center justify-center rounded-xl bg-primary-500 px-5 text-sm font-semibold text-white shadow-soft transition-all hover:bg-primary-600">
            Get Started
          </Link>
        </div>
        <button type="button" className="rounded-lg p-2 text-ink-700 hover:bg-mist md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open ? (
        <nav className="border-t border-line bg-white px-6 py-4 md:hidden" aria-label="Mobile">
          <div className="flex flex-col gap-1">
            <Link href="/dashboard" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-mist">
              <LayoutDashboard className="h-5 w-5" /> Dashboard
            </Link>
            {NAV_ITEMS.filter((i) => i.href !== "/dashboard").map((item) => (
              <Link key={item.href} href={item.href} className={cn("rounded-xl px-3 py-2.5 text-sm font-medium", pathname.startsWith(item.href) ? "bg-primary-50 text-primary-700" : "text-ink-700 hover:bg-mist")}>
                {item.label}
              </Link>
            ))}
            <Link href="/signup" className="mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-primary-500 px-5 text-sm font-semibold text-white">Get Started</Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
