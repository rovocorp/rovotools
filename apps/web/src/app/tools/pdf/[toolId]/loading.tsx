export default function PdfToolLoading(): React.ReactElement {
  return (
    <div role="status" aria-busy="true" aria-label="Loading PDF tool" className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <div className="h-8 w-2/3 animate-pulse rounded-lg bg-muted" />
      <div className="mt-3 h-4 w-1/2 animate-pulse rounded-lg bg-muted" />
      <div className="mt-6 animate-pulse rounded-xl border border-border bg-card p-6">
        <div className="h-24 rounded-lg bg-muted" />
        <div className="mt-3 h-10 w-1/3 rounded-lg bg-muted" />
      </div>
    </div>
  );
}
