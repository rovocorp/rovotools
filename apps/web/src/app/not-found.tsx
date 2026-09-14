import Link from "next/link";
import { t } from "@rovotools/localization";
import { Button } from "@/components/ui/button";

export default function NotFound(): React.ReactElement {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">404</p>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{t("en", "errors.notFound")}</h1>
      <p className="mt-2 text-zinc-500">The page you are looking for does not exist or was moved.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/tools">Browse tools</Link>
        </Button>
      </div>
    </div>
  );
}
