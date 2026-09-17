export default function CategoryLoading(): React.ReactElement {
  return (
    <div role="status" aria-busy="true" aria-label="Loading category" className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <div className="h-8 w-1/3 animate-pulse rounded-lg bg-muted" />
      <div className="mt-3 h-4 w-1/2 animate-pulse rounded-lg bg-muted" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-xl border border-border bg-card" />
        ))}
      </div>
    </div>
  );
}
