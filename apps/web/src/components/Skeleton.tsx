/** Blocs gris animés affichés pendant un chargement */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded bg-slate-300/70 ${className}`} />;
}

export function BoardSkeleton() {
  return (
    <div role="status" aria-label="Chargement du board" className="flex items-start gap-3">
      {[3, 2, 4].map((cards, i) => (
        <div key={i} className="w-72 shrink-0 space-y-2 rounded-xl bg-slate-100/90 p-3">
          <Skeleton className="h-5 w-32" />
          {Array.from({ length: cards }).map((_, j) => (
            <Skeleton key={j} className="h-10 w-full bg-white" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function Spinner({ className = 'h-4 w-4' }: { className?: string }) {
  return <span aria-hidden className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`} />;
}
