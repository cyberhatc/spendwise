export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-lavender">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-100 border-t-primary-500" />
        <p className="text-sm font-medium text-ink-600">Loading SpendWise…</p>
      </div>
    </main>
  );
}
