import { useCallback, useEffect, useState } from "react";
import { clearRecentIds, getRecentIds, trackRecentId } from "@/lib/store";

export function useRecents(): {
  recents: Array<string>;
  track: (toolId: string) => Promise<void>;
  clear: () => Promise<void>;
  refresh: () => Promise<void>;
} {
  const [recents, setRecents] = useState<Array<string>>([]);

  const refresh = useCallback(async () => {
    setRecents(await getRecentIds());
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const track = useCallback(async (toolId: string) => {
    setRecents(await trackRecentId(toolId));
  }, []);

  const clear = useCallback(async () => {
    await clearRecentIds();
    setRecents([]);
  }, []);

  return { recents, track, clear, refresh };
}
