import { DEFAULT_LOCALE, RTL_LOCALES, SUPPORTED_LOCALES, type Locale } from "./keys";

export type TextDirection = "ltr" | "rtl";

export function resolveLocale(requested?: string | null): Locale {
  if (requested === undefined || requested === null || requested.trim() === "") {
    return DEFAULT_LOCALE;
  }
  const normalized = requested.trim().toLowerCase().replace("_", "-");
  const base = normalized.split("-")[0] as Locale;
  if ((SUPPORTED_LOCALES as ReadonlyArray<string>).includes(normalized)) {
    return normalized as Locale;
  }
  if ((SUPPORTED_LOCALES as ReadonlyArray<string>).includes(base)) {
    return base;
  }
  return DEFAULT_LOCALE;
}

export function isRtl(locale: Locale): boolean {
  return (RTL_LOCALES as ReadonlyArray<string>).includes(locale);
}

export function getLocaleDirection(locale: Locale): TextDirection {
  return isRtl(locale) ? "rtl" : "ltr";
}

export function toBcp47(locale: Locale): string {
  switch (locale) {
    case "zh":
      return "zh-CN";
    case "pt":
      return "pt-PT";
    case "bn":
      return "bn-BD";
    default:
      return locale;
  }
}

export function formatNumber(
  locale: Locale,
  value: number,
  options?: Intl.NumberFormatOptions,
): string {
  if (!Number.isFinite(value)) {
    return String(value);
  }
  try {
    return new Intl.NumberFormat(toBcp47(locale), options).format(value);
  } catch {
    return String(value);
  }
}

export function formatCurrency(locale: Locale, value: number, currency: string): string {
  if (!Number.isFinite(value) || currency.trim() === "") {
    return String(value);
  }
  try {
    return new Intl.NumberFormat(toBcp47(locale), {
      style: "currency",
      currency: currency.trim().toUpperCase(),
    }).format(value);
  } catch {
    return `${currency.trim().toUpperCase()} ${String(value)}`;
  }
}

export function formatUnit(
  locale: Locale,
  value: number,
  unit: string,
  display: "short" | "long" | "narrow" = "short",
): string {
  if (!Number.isFinite(value) || unit.trim() === "") {
    return String(value);
  }
  try {
    return new Intl.NumberFormat(toBcp47(locale), {
      style: "unit",
      unit: unit.trim(),
      unitDisplay: display,
    }).format(value);
  } catch {
    return `${String(value)} ${unit.trim()}`;
  }
}

export function formatDate(
  locale: Locale,
  isoDate: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
  if (match === null || match[1] === undefined || match[2] === undefined || match[3] === undefined) {
    return isoDate;
  }
  try {
    const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
    if (Number.isNaN(date.getTime())) {
      return isoDate;
    }
    return new Intl.DateTimeFormat(toBcp47(locale), {
      dateStyle: "medium",
      timeZone: "UTC",
      ...options,
    }).format(date);
  } catch {
    return isoDate;
  }
}
