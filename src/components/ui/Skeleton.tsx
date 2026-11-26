export function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse-soft rounded-xl bg-mist ${className ?? "h-4 w-full"}`} />;
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={`rounded-2xl bg-white p-5 shadow-card sm:p-6 ${className ?? ""}`}>
      <Skeleton className="h-4 w-28" />
      <Skeleton className="mt-4 h-8 w-32" />
      <Skeleton className="mt-4 h-3 w-40" />
    </div>
  );
}
