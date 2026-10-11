"use client";

import Link from "next/link";

// Root-layout error boundary (error.tsx cannot catch failures inside the
// root layout itself). Deliberately minimal: no app chrome (that may be the
// thing that crashed) — plain styles, one recovery path.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.ReactElement {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Something went wrong</h1>
        <p style={{ color: "#52525b" }}>
          An unexpected error occurred. Try again, or head back to the homepage.
        </p>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              borderRadius: "0.75rem",
              background: "#4f46e5",
              color: "white",
              fontWeight: 600,
              padding: "0.6rem 1.25rem",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          <Link
            href="/"
            style={{
              borderRadius: "0.75rem",
              border: "1px solid #d4d4d8",
              fontWeight: 600,
              padding: "0.6rem 1.25rem",
            }}
          >
            Go home
          </Link>
        </div>
      </body>
    </html>
  );
}
