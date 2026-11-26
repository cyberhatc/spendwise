"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  PiggyBank,
  CalendarDays,
  BarChart3,
  Sparkles,
  Users,
  Repeat,
  Flame,
  BadgePercent,
  UserRound,
  LifeBuoy,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/budgets", label: "Budgets", icon: Wallet },
  { href: "/savings", label: "Savings", icon: PiggyBank },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

const SECONDARY: NavItem[] = [
  { href: "/ai", label: "AI Assistant", icon: Sparkles },
  { href: "/splits", label: "Splits", icon: Users },
  { href: "/recurring", label: "Recurring", icon: Repeat },
  { href: "/challenges", label: "Challenges", icon: Flame },
  { href: "/discounts", label: "Discounts", icon: BadgePercent },
  { href: "/profile", label: "Profile", icon: UserRound },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  const render = (items: NavItem[]) =>
    items.map((item) => {
      const Icon = item.icon;
      const active = isActive(item.href);
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            active ? "bg-primary-50 text-primary-700" : "text-ink-700 hover:bg-mist hover:text-ink-900"
          )}
        >
          <Icon className="h-5 w-5" />
          {item.label}
        </Link>
      );
    });

  return (
    <>
      <p className="px-3 pb-2 pt-2 text-xs font-semibold uppercase tracking-wider text-ink-500">Manage</p>
      {render(NAV)}
      <p className="px-3 pb-2 pt-4 text-xs font-semibold uppercase tracking-wider text-ink-500">Students</p>
      {render(SECONDARY)}
      <div className="px-3 pt-4">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-mist"
        >
          <LifeBuoy className="h-5 w-5" />
          Help &amp; support
        </Link>
      </div>
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-lavender">
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-900/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-cardHover animate-fade-up">
            <div className="flex h-16 items-center justify-between border-b border-line px-5">
              <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500 text-white shadow-soft">
                  <Wallet className="h-5 w-5" />
                </span>
                <span className="font-display text-lg font-bold text-ink-900">{APP_NAME}</span>
              </Link>
              <button type="button" className="rounded-lg p-2 text-ink-500 hover:bg-mist" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Primary mobile">
              <NavLinks onNavigate={() => setMobileOpen(false)} />
            </nav>
          </aside>
        </div>
      ) : null}

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-white lg:flex">
        <div className="flex h-16 items-center border-b border-line px-5">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500 text-white shadow-soft">
              <Wallet className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-bold text-ink-900">{APP_NAME}</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Primary">
          <NavLinks />
        </nav>
      </aside>

      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-white/90 px-4 backdrop-blur lg:hidden">
        <button type="button" className="rounded-lg p-2 text-ink-700 hover:bg-mist" onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <Menu className="h-6 w-6" />
        </button>
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-white">
            <Wallet className="h-4 w-4" />
          </span>
          <span className="font-display text-lg font-bold text-ink-900">{APP_NAME}</span>
        </Link>
        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-2 rounded-full p-1.5 hover:bg-mist"
            onClick={() => setUserMenuOpen((v) => !v)}
            aria-label="Account menu"
            aria-expanded={userMenuOpen}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
              {(user?.user_metadata?.full_name ?? user?.email ?? "U").charAt(0).toUpperCase()}
            </span>
          </button>
          {userMenuOpen ? (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-line bg-white p-2 shadow-cardHover">
              <div className="px-3 py-2">
                <p className="text-sm font-semibold text-ink-900">{user?.user_metadata?.full_name ?? user?.email}</p>
                <p className="text-xs text-ink-500">{user?.email}</p>
              </div>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-ink-700 hover:bg-mist"
                onClick={() => {
                  setUserMenuOpen(false);
                  void (async () => {
                    try {
                      await signOut();
                      toast("Signed out successfully", "info");
                    } catch {
                      toast("Could not sign out", "error");
                    }
                  })();
                }}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <div className="lg:flex">
        <aside className="hidden lg:block lg:w-64 lg:shrink-0" aria-hidden="true" />
        <main className="min-h-screen flex-1 pb-24 pt-14 lg:pb-10 lg:pt-0 lg:pl-64">{children}</main>
      </div>
    </div>
  );
}
