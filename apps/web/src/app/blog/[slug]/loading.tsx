export default function BlogPostLoading(): React.ReactElement {
  return (
    <article role="status" aria-busy="true" aria-label="Loading article" className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <div className="h-9 w-3/4 animate-pulse rounded-lg bg-muted" />
      <div className="mt-3 h-4 w-1/4 animate-pulse rounded-lg bg-muted" />
      <div className="mt-6 space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-4 w-full animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    </article>
  );
}
