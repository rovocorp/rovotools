"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { t } from "@rovotools/localization";
import { Input } from "@/components/ui/input";

function SearchField({ initialQuery }: { initialQuery: string }): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim() === "") {
        params.delete("q");
      } else {
        params.set("q", value.trim());
      }
      router.replace(`/tools?${params.toString()}`, { scroll: false });
    }, 300);
    return () => clearTimeout(timer);
  }, [value, router, searchParams]);

  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
        aria-hidden="true"
      />
      <Input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={`${t("en", "common.search")} tools...`}
        aria-label={t("en", "a11y.searchTools")}
        className="pl-9"
      />
    </div>
  );
}

export default function SearchBar({ initialQuery }: { initialQuery: string }): React.ReactElement {
  return (
    <Suspense fallback={null}>
      <SearchField initialQuery={initialQuery} />
    </Suspense>
  );
}
