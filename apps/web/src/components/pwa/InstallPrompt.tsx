"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { t } from "@rovotools/localization";
import { useConsentDecided } from "@/lib/analytics";
import { Button } from "@/components/ui/button";

const DISMISS_KEY = "rovotools:install-dismissed";
const COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;
const ENGAGEMENT_DELAY_MS = 25_000;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone(): boolean {
  if (window.matchMedia("(display-mode: standalone)").matches) {
    return true;
  }
  return (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function isIos(): boolean {
  return /iPad|iPhone|iPod/.test(window.navigator.userAgent);
}

function coolingDown(): boolean {
  try {
    const dismissed = localStorage.getItem(DISMISS_KEY);
    return dismissed !== null && Date.now() - Number(dismissed) < COOLDOWN_MS;
  } catch {
    return true;
  }
}

function dismiss(): void {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    // Dismissal persistence is best-effort.
  }
}

export default function InstallPrompt(): React.ReactElement | null {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [iosHint, setIosHint] = useState(false);
  // Never stack the install card on top of the cookie banner: wait until
  // consent is decided. Event capture below is unaffected.
  const consentDecided = useConsentDecided();

  useEffect(() => {
    if (isStandalone() || coolingDown()) {
      return;
    }

    let timer: ReturnType<typeof setTimeout> | null = null;
    const onPrompt = (event: Event): void => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      // Only surface after genuine engagement, never on first paint.
      timer = setTimeout(() => setVisible(true), ENGAGEMENT_DELAY_MS);
    };

    if (isIos()) {
      timer = setTimeout(() => setIosHint(true), ENGAGEMENT_DELAY_MS);
    } else {
      window.addEventListener("beforeinstallprompt", onPrompt);
    }
    return () => {
      if (timer !== null) {
        clearTimeout(timer);
      }
      window.removeEventListener("beforeinstallprompt", onPrompt);
    };
  }, []);

  async function handleInstall(): Promise<void> {
    if (deferred === null) {
      return;
    }
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") {
      setVisible(false);
    } else {
      dismiss();
      setVisible(false);
    }
    setDeferred(null);
  }

  function handleDismiss(): void {
    dismiss();
    setVisible(false);
    setIosHint(false);
  }

  if (!consentDecided) {
    return null;
  }

  if (visible && deferred !== null) {
    return (
      <div
        role="dialog"
        aria-label={t("en", "pwa.installTitle")}
        className="fixed bottom-4 left-1/2 z-[70] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {t("en", "pwa.installTitle")}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {t("en", "pwa.installBody")}
            </p>
          </div>
          <Button size="icon" variant="ghost" onClick={handleDismiss} aria-label={t("en", "a11y.dismiss")}>
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={handleInstall}>
            <Download className="h-4 w-4" aria-hidden="true" />
            {t("en", "pwa.install")}
          </Button>
          <Button size="sm" variant="ghost" onClick={handleDismiss}>
            {t("en", "pwa.notNow")}
          </Button>
        </div>
      </div>
    );
  }

  if (iosHint) {
    return (
      <div
        role="dialog"
        aria-label={t("en", "pwa.iosHintTitle")}
        className="fixed bottom-4 left-1/2 z-[70] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {t("en", "pwa.iosHintTitle")}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {t("en", "pwa.iosHintBody")}
            </p>
          </div>
          <Button size="icon" variant="ghost" onClick={handleDismiss} aria-label={t("en", "a11y.dismiss")}>
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
