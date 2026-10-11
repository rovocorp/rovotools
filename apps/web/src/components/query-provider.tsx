"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  // One client per component instance (useState initializer): on the server
  // that means one per request, so query state can never leak between SSR
  // renders — the documented TanStack Query + Next.js pattern. On the client
  // the initializer runs once per mount.
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
