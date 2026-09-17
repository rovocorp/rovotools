"use client";

import { useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { setConsent, useConsent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";

export default function CookieBanner(): React.ReactElement {
  const consent = useConsent();
  // Optimistic local dismissal: the popup must close the moment a button is
  // clicked, even if the consent-store subscription hiccups in this browser.
  // The store write still persists the choice (storage + cross-tab sync).
  const [dismissed, setDismissed] = useState(false);

  if (consent !== "unknown" || dismissed) {
    return <></>;
  }

  function choose(value: "granted" | "denied"): void {
    setDismissed(true);
    setConsent(value);
  }

  return (
    <div
      id="cookie-banner"
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed inset-x-4 bottom-4 z-[80] mx-auto max-w-2xl rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-700 dark:bg-zinc-950"
    >
      <p className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100">
        <Cookie className="h-5 w-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
        Privacy-first cookies
      </p>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        RovoTools works without tracking. Optional anonymous analytics only run if you accept.{" "}
        <Link href="/cookie-policy" className="underline hover:text-indigo-600 dark:hover:text-indigo-300">
          Cookie Policy
        </Link>
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={() => choose("granted")}>
          Accept
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => choose("denied")}>
          Reject
        </Button>
      </div>
    </div>
  );
}
