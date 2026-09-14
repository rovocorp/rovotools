"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";

let client: QueryClient | null = null;

function getQueryClient(): QueryClient {
  if (client === null) {
    client = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60_000,
          refetchOnWindowFocus: false,
        },
      },
    });
  }
  return client;
}

export function QueryProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  return <QueryClientProvider client={getQueryClient()}>{children}</QueryClientProvider>;
}
