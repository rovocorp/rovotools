"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

const STORAGE_KEY = "rovotools:favorites";
const QUERY_KEY = ["favorites"] as const;

function readLocal(): Array<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw === null ? [] : JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function writeLocal(ids: Array<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Favorites persist best-effort on the client.
  }
}

export function useFavorites(): {
  favorites: Array<string>;
  toggle: (toolId: string) => void;
  isPending: boolean;
} {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: QUERY_KEY, queryFn: () => Promise.resolve(readLocal()) });

  const mutation = useMutation({
    mutationFn: (ids: Array<string>): Promise<Array<string>> => {
      writeLocal(ids);
      return Promise.resolve(ids);
    },
    onSuccess: (ids) => {
      queryClient.setQueryData(QUERY_KEY, ids);
    },
  });

  const toggle = useCallback(
    (toolId: string) => {
      const current = query.data ?? readLocal();
      const next = current.includes(toolId)
        ? current.filter((id) => id !== toolId)
        : [...current, toolId];
      mutation.mutate(next);
    },
    [mutation, query.data],
  );

  return { favorites: query.data ?? [], toggle, isPending: mutation.isPending };
}
