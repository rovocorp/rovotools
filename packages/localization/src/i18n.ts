import type { I18nKey, Locale } from "./keys";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "./keys";
import { translations } from "./loader";

function lookup(locale: Locale, key: string): unknown {
  let current: unknown = translations[locale];
  for (const segment of key.split(".")) {
    if (current !== null && typeof current === "object" && segment in current) {
      current = (current as Record<string, unknown>)[segment];
    } else {
      return undefined;
    }
  }
  return current;
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (vars === undefined) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = vars[name];
    return value === undefined ? match : String(value);
  });
}

export function t(locale: Locale, key: I18nKey): string {
  const value = lookup(locale, key) ?? lookup(DEFAULT_LOCALE, key);
  return typeof value === "string" ? value : key;
}

export function tx(
  locale: Locale,
  key: I18nKey,
  vars?: Record<string, string | number>,
): string {
  return interpolate(t(locale, key), vars);
}

export function getSupportedLocales(): ReadonlyArray<Locale> {
  return SUPPORTED_LOCALES;
}
