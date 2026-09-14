import React from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import type { ReactNode } from "react";
import { translations } from "@rovotools/localization";

i18n.use(initReactI18next).init({
  lng: "en",
  fallbackLng: "en",
  resources: {
    en: { translation: translations.en },
    ar: { translation: translations.ar },
    ur: { translation: translations.ur },
  },
  interpolation: {
    escapeValue: false,
  },
});

export function I18nProvider({ children }: { children: ReactNode }) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
