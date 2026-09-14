"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { t } from "@rovotools/localization";
import { SW_UPDATE_EVENT } from "@/components/PWARegister";
import { useConsentDecided } from "@/lib/analytics";
import { Button } from "@/components/ui/button";

export default function PwaUpdatePrompt(): React.ReactElement | null {
  const [visible, setVisible] = useState(false);
  // Queue behind the cookie banner so floating cards never overlap.
  const consentDecided = useConsentDecided();

  useEffect(() => {
    const onUpdate = (): void => setVisible(true);
    window.addEventListener(SW_UPDATE_EVENT, onUpdate);
    return () => window.removeEventListener(SW_UPDATE_EVENT, onUpdate);
  }, []);

  if (!visible || !consentDecided) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 z-[70] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl border border-indigo-200 bg-white p-4 shadow-xl dark:border-indigo-900 dark:bg-zinc-900"
    >
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
        {t("en", "pwa.updateTitle")}
      </p>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        {t("en", "pwa.updateBody")}
      </p>
      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          {t("en", "pwa.refresh")}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setVisible(false)}>
          {t("en", "pwa.later")}
        </Button>
      </div>
    </div>
  );
}
