import React from "react";
import Link from "next/link";
import { Github, Twitter, Instagram, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-10 sm:flex-row sm:items-center">
        <div>
          <p className="font-display text-lg font-bold text-ink-900">SpendWise</p>
          <p className="mt-1 text-sm text-ink-500">Track Smart. Spend Better. Save More.</p>
        </div>
        <div className="flex items-center gap-4 text-ink-500">
          <Link href="/dashboard" className="transition-colors hover:text-primary-600">Dashboard</Link>
          <Link href="/transactions" className="transition-colors hover:text-primary-600">Transactions</Link>
          <Link href="/analytics" className="transition-colors hover:text-primary-600">Analytics</Link>
          <Link href="/ai" className="transition-colors hover:text-primary-600">AI Assistant</Link>
        </div>
        <div className="flex items-center gap-3 text-ink-500">
          <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter" className="transition-colors hover:text-primary-600"><Twitter className="h-5 w-5" /></a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="transition-colors hover:text-primary-600"><Instagram className="h-5 w-5" /></a>
          <a href="mailto:hello@spendwise.app" aria-label="Email" className="transition-colors hover:text-primary-600"><Mail className="h-5 w-5" /></a>
        </div>
      </div>
    </footer>
  );
}
