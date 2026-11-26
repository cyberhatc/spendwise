import type { Metadata } from "next";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-lavender px-6">
      <div className="max-w-md text-center">
        <p className="font-display text-6xl font-bold text-primary-500">404</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-ink-900">Page not found</h1>
        <p className="mt-2 text-ink-600">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/dashboard" className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-primary-500 px-6 font-semibold text-white">
          Go to dashboard
        </Link>
      </div>
    </main>
  );
}

export const metadata: Metadata = {
  title: "Page not found",
};
