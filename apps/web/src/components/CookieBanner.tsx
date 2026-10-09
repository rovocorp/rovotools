"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { setConsentPreferences, useConsent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}): React.ReactElement {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-zinc-200 p-3 dark:border-zinc-700">
      <span>
        <span className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">{label}</span>
        <span className="mt-0.5 block text-sm text-zinc-500 dark:text-zinc-400">{description}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-indigo-600" : "bg-zinc-300 dark:bg-zinc-700"
        }`}
      >
        <span
          aria-hidden="true"
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </label>
  );
}

export default function CookieBanner(): React.ReactElement {
  const consent = useConsent();
  // Optimistic local dismissal: the popup must close the moment a button is
  // clicked, even if the consent-store subscription hiccups in this browser.
  // The store write still persists the choice (storage + cross-tab sync).
  const [dismissed, setDismissed] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [advertising, setAdvertising] = useState(false);
  const settingsHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (customizing) {
      settingsHeadingRef.current?.focus();
    }
  }, [customizing]);

  useEffect(() => {
    if (!customizing) {
      return;
    }
    function onKey(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        setCustomizing(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [customizing]);

  if (consent !== "unknown" || dismissed) {
    return <></>;
  }

  function save(prefs: { analytics: boolean; advertising: boolean }): void {
    setDismissed(true);
    setConsentPreferences(prefs);
  }

  if (customizing) {
    return (
      <div
        id="cookie-banner"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-settings-heading"
        className="fixed inset-x-4 bottom-4 z-[80] mx-auto max-w-2xl rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-700 dark:bg-zinc-950"
      >
        <h2
          id="cookie-settings-heading"
          ref={settingsHeadingRef}
          tabIndex={-1}
          className="flex items-center gap-2 font-semibold text-zinc-900 outline-none dark:text-zinc-100"
        >
          <Cookie className="h-5 w-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
          Cookie settings
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          RovoTools works without tracking. Choose which optional purposes may run. Rejecting
          disables analytics; ads keep showing but switch to non-personalized (contextual only,
          no ad personalization) — the tools keep working.{" "}
          <Link href="/cookie-policy" className="underline hover:text-indigo-600 dark:hover:text-indigo-300">
            Cookie Policy
          </Link>
        </p>
        <div className="mt-4 space-y-2">
          <Toggle
            label="Anonymous analytics"
            description="Helps us understand which tools are used. No inputs or files tracked."
            checked={analytics}
            onChange={setAnalytics}
          />
          <Toggle
            label="Advertising (Google AdSense)"
            description="Shows ads to keep the tools free. Accept for personalized ads; rejecting still shows non-personalized (contextual-only) ads."
            checked={advertising}
            onChange={setAdvertising}
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={() => save({ analytics: true, advertising: true })}>
            Accept all
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => save({ analytics: false, advertising: false })}
          >
            Reject all
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => save({ analytics, advertising })}
          >
            Save selection
          </Button>
        </div>
      </div>
    );
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
        RovoTools works without tracking. Optional anonymous analytics and advertising (Google
        AdSense) personalize only if you accept — otherwise you see non-personalized ads.{" "}
        <Link href="/cookie-policy" className="underline hover:text-indigo-600 dark:hover:text-indigo-300">
          Cookie Policy
        </Link>
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          onClick={() => save({ analytics: true, advertising: true })}
        >
          Accept
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => setCustomizing(true)}>
          Customize
        </Button>
      </div>
    </div>
  );
}
