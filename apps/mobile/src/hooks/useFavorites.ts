import { useCallback, useEffect, useState } from "react";
import { getFavoriteIds, toggleFavoriteId } from "@/lib/store";

export function useFavorites(): {
  favorites: Array<string>;
  toggle: (toolId: string) => Promise<void>;
  refresh: () => Promise<void>;
} {
  const [favorites, setFavorites] = useState<Array<string>>([]);

  const refresh = useCallback(async () => {
    setFavorites(await getFavoriteIds());
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const toggle = useCallback(async (toolId: string) => {
    setFavorites(await toggleFavoriteId(toolId));
  }, []);

  return { favorites, toggle, refresh };
}
