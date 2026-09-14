import type { Locale } from "./keys";
import { ar } from "./locales/ar";
import { en } from "./locales/en";
import { ur } from "./locales/ur";

export interface Translations {
  [key: string]: string | Translations;
}

export { ar, en, ur };

export const translations: Record<Locale, Translations> = {
  en,
  es: en,
  fr: en,
  de: en,
  pt: en,
  it: en,
  nl: en,
  ar,
  hi: en,
  ur,
  bn: en,
  zh: en,
  ja: en,
  ko: en,
};
