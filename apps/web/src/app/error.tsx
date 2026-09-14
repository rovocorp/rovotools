"use client";

import Link from "next/link";
import { t } from "@rovotools/localization";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.ReactElement {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold sm:text-3xl">{t("en", "errors.unknown")}</h1>
      {error.digest !== undefined && error.digest !== "" ? (
        <p className="mt-2 text-xs text-zinc-500">Reference: {error.digest}</p>
      ) : null}
      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          {t("en", "common.retry")}
        </button>
        <Link href="/" className="text-sm font-semibold text-indigo-600 hover:underline">
          {t("en", "navigation.home")}
        </Link>
      </div>
    </div>
  );
}
