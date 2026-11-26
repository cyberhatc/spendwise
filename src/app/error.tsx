"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("SpendWise error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-lavender px-6">
      <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-card ring-1 ring-line">
        <h1 className="font-display text-2xl font-bold text-ink-900">Something went wrong</h1>
        <p className="mt-2 text-sm text-ink-600">{error.message || "An unexpected error occurred."}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => reset()}>Try again</Button>
          <Button variant="outline" onClick={() => window.location.href = "/dashboard"}>Back to dashboard</Button>
        </div>
      </div>
    </main>
  );
}
