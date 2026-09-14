"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

const STORAGE_KEY = "rovotools:favorites";
const DEVICE_KEY = "rovotools:device-id";
const QUERY_KEY = ["favorites"] as const;

function getOrCreateDeviceId(): string {
  try {
    const existing = localStorage.getItem(DEVICE_KEY);
    if (existing !== null && existing !== "") {
      return existing;
    }
    const fresh = typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(DEVICE_KEY, fresh);
    return fresh;
  } catch {
    return "anonymous";
  }
}

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

async function fetchFavorites(): Promise<Array<string>> {
  try {
    const deviceId = getOrCreateDeviceId();
    const response = await fetch(`/api/favorites?deviceId=${encodeURIComponent(deviceId)}`, { method: "GET" });
    if (!response.ok) {
      return readLocal();
    }
    const data: unknown = await response.json();
    if (
      typeof data === "object" &&
      data !== null &&
      "favorites" in data &&
      Array.isArray((data as { favorites: unknown }).favorites)
    ) {
      const ids = (data as { favorites: Array<unknown> }).favorites.filter(
        (id): id is string => typeof id === "string",
      );
      writeLocal(ids);
      return ids;
    }
    return readLocal();
  } catch {
    return readLocal();
  }
}

export function useFavorites(): {
  favorites: Array<string>;
  toggle: (toolId: string) => void;
  isPending: boolean;
} {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: QUERY_KEY, queryFn: fetchFavorites });

  const mutation = useMutation({
    mutationFn: async (ids: Array<string>): Promise<Array<string>> => {
      writeLocal(ids);
      try {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ deviceId: getOrCreateDeviceId(), favorites: ids }),
        });
      } catch {
        // Server sync is best-effort; local copy is authoritative offline.
      }
      return ids;
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
