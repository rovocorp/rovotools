"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Download, Heart, RotateCcw, Wifi } from "lucide-react";
import { getFieldLabel, getFieldPlaceholder, getOutputLabel, registerCoreTools, toolRegistry } from "@rovotools/tools";
import { todaySlashDDMMYYYY } from "@rovotools/calculations";
import type { ToolInputField, ValidationError } from "@rovotools/types";
import { t } from "@rovotools/localization";
import { useFavorites } from "@/hooks/useFavorites";
import { webShare, webStorage } from "@/lib/adapters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DateInput from "@/components/tools/DateInput";
import { cn } from "@/lib/utils";

registerCoreTools(toolRegistry);

function QrPreview({ payload }: { payload: string }): React.ReactElement {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    import("qrcode")
      .then((mod) => mod.toDataURL(payload, { margin: 1, width: 220 }))
      .then((url) => {
        if (!cancelled) {
          setSrc(url);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSrc(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [payload]);
  if (src === null) {
    return <></>;
  }
  return (
    <div className="rounded-lg bg-white p-3 dark:bg-zinc-900">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={`QR code for ${payload.slice(0, 60)}`} width={220} height={220} className="mx-auto" loading="lazy" />
    </div>
  );
}

function initialValues(fields: ReadonlyArray<ToolInputField>): Record<string, string> {
  const values: Record<string, string> = {};
  for (const field of fields) {
    if (field.defaultValue !== undefined && field.defaultValue !== null && String(field.defaultValue) === "today") {
      // "Calculate age at" style defaults: prefill with today's date.
      values[field.id] = todaySlashDDMMYYYY();
    } else {
      values[field.id] =
        field.defaultValue === undefined || field.defaultValue === null
          ? field.type === "boolean"
            ? "false"
            : ""
          : String(field.defaultValue);
    }
  }
  return values;
}

// Fields rendered with the hybrid text + calendar-picker widget
// (DD/MM/YYYY) instead of a plain text box.
function isCalendarField(toolId: string, fieldId: string): boolean {
  return (
    (toolId === "date-difference-calculator" && (fieldId === "from" || fieldId === "to")) ||
    (toolId === "age-calculator" && (fieldId === "birthDate" || fieldId === "asOfDate")) ||
    (toolId === "date-formatter" && fieldId === "date")
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: ToolInputField;
  value: string;
  onChange: (value: string) => void;
}): React.ReactElement {
  const label = getFieldLabel("en", field);
  const placeholder = getFieldPlaceholder("en", field);
  if (field.type === "select") {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={field.id}>{label}</Label>
        <select
          id={field.id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="">{t("en", "common.selectOption")}</option>
          {(field.options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {getOutputLabel("en", { id: option.value, type: "string", labelKey: option.labelKey })}
            </option>
          ))}
        </select>
      </div>
    );
  }
  if (field.type === "boolean") {
    return (
      <div className="flex items-center gap-2">
        <input
          id={field.id}
          type="checkbox"
          checked={value === "true"}
          onChange={(event) => onChange(event.target.checked ? "true" : "false")}
          className="h-4 w-4 rounded accent-indigo-600"
        />
        <Label htmlFor={field.id}>{label}</Label>
      </div>
    );
  }
  if (field.type === "textarea") {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={field.id}>{label}</Label>
        <textarea
          id={field.id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>
    );
  }
  return (
    <div className="space-y-1.5">
      <Label htmlFor={field.id}>{label}</Label>
      <Input
        id={field.id}
        type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
        inputMode={field.type === "number" ? "decimal" : undefined}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        required={field.required}
      />
    </div>
  );
}

function TableOutput({ value }: { value: string }): React.ReactElement {
  const rows = value.split("\n");
  // Drop a single trailing empty row from a trailing newline; keep the rest
  // (blank lines inside cleaned text are meaningful).
  const trimmed = rows.length > 1 && rows[rows.length - 1]?.trim() === "" ? rows.slice(0, -1) : rows;
  const capped = trimmed.slice(0, 500);
  return (
    <table className="mt-2 w-full border-collapse text-left text-sm font-normal">
      <thead>
        <tr className="border-b border-zinc-200 dark:border-zinc-700">
          <th scope="col" className="w-10 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            #
          </th>
          <th scope="col" className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Result
          </th>
        </tr>
      </thead>
      <tbody>
        {capped.map((line, index) => (
          <tr key={`${index}-${line.slice(0, 24)}`} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
            <th scope="row" className="w-10 px-2 py-1 align-top font-mono text-xs text-zinc-500 dark:text-zinc-400">
              {index + 1}
            </th>
            <td className="break-words px-2 py-1 font-mono text-zinc-900 dark:text-zinc-100">
              {line === "" ? <span className="text-zinc-400">(blank)</span> : line}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function ToolRunner({ slug }: { slug: string }): React.ReactElement {
  const entry = useMemo(() => toolRegistry.getBySlug(slug), [slug]);
  const [values, setValues] = useState<Record<string, string>>(() =>
    initialValues(entry?.definition.inputs ?? []),
  );
  const [errors, setErrors] = useState<ReadonlyArray<ValidationError>>([]);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [running, setRunning] = useState(false);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [offline, setOffline] = useState(
    () => typeof navigator !== "undefined" && !navigator.onLine,
  );
  const { favorites, toggle } = useFavorites();

  useEffect(() => {
    const goOffline = (): void => setOffline(true);
    const goOnline = (): void => setOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  if (entry === undefined) {
    return <p className="text-sm text-red-600">Tool not found.</p>;
  }
  const tool = entry.definition;
  const isFavorite = favorites.includes(tool.id);

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setRunning(true);
    setResult(null);
    try {
      const validation = tool.validate(values);
      if (!validation.valid) {
        setErrors(validation.errors);
        return;
      }
      setErrors([]);
      const output = await tool.execute(values);
      setResult(output as Record<string, unknown>);
      try {
        const stored = JSON.parse((await webStorage.getItem("rovotools:recents")) ?? "[]") as Array<string>;
        const next = [tool.id, ...stored.filter((id) => id !== tool.id)].slice(0, 10);
        await webStorage.setItem("rovotools:recents", JSON.stringify(next));
      } catch {
        // Recents are best-effort on the client.
      }
    } catch (error) {
      setErrors([
        {
          fieldId: "general",
          code: "EXECUTION_ERROR",
          message: error instanceof Error ? error.message : "Calculation failed.",
        },
      ]);
    } finally {
      setRunning(false);
    }
  }

  function resultText(): string {
    if (result === null) {
      return "";
    }
    return tool.outputs.map((output) => `${getOutputLabel("en", output)}: ${String(result[output.id] ?? "—")}`).join("\n");
  }

  async function handleCopy(): Promise<void> {
    if (result === null) {
      return;
    }
    try {
      await navigator.clipboard.writeText(`${tool.name}\n${resultText()}`);
      setCopyStatus(t("en", "tool.copiedToClipboard"));
    } catch {
      setCopyStatus(t("en", "errors.shareFailed"));
    }
  }

  function handleDownload(): void {
    if (result === null) {
      return;
    }
    // Text-to-PDF produces a real PDF payload: download it as a .pdf file.
    const pdfB64 = result["pdfBase64"];
    if (typeof pdfB64 === "string" && pdfB64.length > 0) {
      const binary = atob(pdfB64);
      const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${tool.slug}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      return;
    }
    const blob = new Blob([`${tool.name}\n${resultText()}`], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tool.slug}-result.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function handleReset(): void {
    setValues(initialValues(tool.inputs));
    setErrors([]);
    setResult(null);
    setShareStatus(null);
    setCopyStatus(null);
  }

  async function handleShare(): Promise<void> {
    if (result === null) {
      return;
    }
    const lines = tool.outputs.map((output) => `${output.id}: ${String(result[output.id] ?? "—")}`);
    const outcome = await webShare.shareText(`${tool.name}\n${lines.join("\n")}`, tool.name);
    setShareStatus(
      outcome.method === "sheet"
        ? outcome.completed
          ? t("en", "tool.shared")
          : t("en", "tool.shareDismissed")
        : outcome.method === "clipboard"
          ? t("en", "tool.copiedToClipboard")
          : t("en", "tool.shareUnavailable"),
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t("en", "tool.inputs")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {tool.inputs.map((field) =>
              isCalendarField(tool.id, field.id) ? (
                <DateInput
                  key={field.id}
                  id={field.id}
                  label={getFieldLabel("en", field)}
                  value={values[field.id] ?? ""}
                  onChange={(value) => setValues((prev) => ({ ...prev, [field.id]: value }))}
                  placeholder={getFieldPlaceholder("en", field) || "DD-MM-YYYY"}
                  required={field.required}
                />
              ) : (
                <FieldInput
                  key={field.id}
                  field={field}
                  value={values[field.id] ?? ""}
                  onChange={(value) => setValues((prev) => ({ ...prev, [field.id]: value }))}
                />
              ),
            )}
            {errors.length > 0 ? (
              <ul aria-live="polite" className="space-y-1 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
                {errors.map((error, index) => (
                  <li key={`${error.fieldId}-${index}`}>
                    {error.fieldId}: {error.message ?? error.code}
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={running}>
                {running
                  ? (tool.actionRunningLabel ?? t("en", "tool.calculating"))
                  : (tool.actionLabel ?? t("en", "tool.execute"))}
              </Button>
              <Button type="button" variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                {t("en", "common.reset")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => toggle(tool.id)}
                aria-pressed={isFavorite}
              >
                <Heart
                  className={cn("h-4 w-4", isFavorite ? "fill-red-500 text-red-500" : "")}
                  aria-hidden="true"
                />
                {isFavorite ? t("en", "tool.saved") : t("en", "common.save")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card aria-live="polite">
        <CardHeader>
          <CardTitle>{t("en", "tool.result")}</CardTitle>
        </CardHeader>
        <CardContent>
          {result === null ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("en", "tool.noResults")}</p>
          ) : (
            <dl className="space-y-3">
              {tool.outputs.map((output) => (
                <div
                  key={output.id}
                  className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900"
                >
                  <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    {getOutputLabel("en", output)}
                  </dt>
                  <dd className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {output.display === "table" ? (
                      <TableOutput value={String(result[output.id] ?? "—")} />
                    ) : (
                      String(result[output.id] ?? "—")
                    )}
                  </dd>
                </div>
              ))}
              {tool.requiresNetwork ? (
                <Badge variant="outline" className="inline-flex items-center gap-1">
                  <Wifi className="h-3 w-3" aria-hidden="true" />
                  {t("en", "tool.requiresInternet")}
                </Badge>
              ) : null}
              {offline && tool.processingMode === "LOCAL" && !tool.requiresNetwork ? (
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  {t("en", "tool.offlineComputed")}
                </p>
              ) : null}
              {offline && tool.requiresNetwork ? (
                <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                  {t("en", "tool.offlineBlocked")}
                </p>
              ) : null}
              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" variant="outline" onClick={() => void handleShare()}>
                  {t("en", "tool.shareResults")}
                </Button>
                <Button type="button" variant="outline" onClick={() => void handleCopy()}>
                  <Copy className="h-4 w-4" aria-hidden="true" />
                  {t("en", "common.copy")}
                </Button>
                <Button type="button" variant="outline" onClick={handleDownload}>
                  <Download className="h-4 w-4" aria-hidden="true" />
                  {t("en", "common.download")}
                </Button>
                {shareStatus !== null ? (
                  <p aria-live="polite" className="text-xs text-zinc-600 dark:text-zinc-400">
                    {shareStatus}
                  </p>
                ) : null}
                {copyStatus !== null ? (
                  <p aria-live="polite" className="text-xs text-zinc-600 dark:text-zinc-400">
                    {copyStatus}
                  </p>
                ) : null}
              </div>
              {typeof result["qrPayload"] === "string" && (result["qrPayload"] as string).length > 0 ? (
                <QrPreview payload={result["qrPayload"] as string} />
              ) : null}
            </dl>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
