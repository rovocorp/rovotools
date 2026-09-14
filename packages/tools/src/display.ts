import { t, type I18nKey, type Locale } from "@rovotools/localization";
import type { ToolDefinition, ToolInputField, ToolOutputField } from "@rovotools/types";

function localize(locale: Locale, key: string, fallback: string): string {
  const value = t(locale, key as I18nKey);
  return value === key ? fallback : value;
}

export function getToolDisplay(
  locale: Locale,
  definition: ToolDefinition,
): { name: string; description: string } {
  return {
    name: localize(locale, definition.nameKey, definition.name),
    description: localize(locale, definition.descriptionKey, definition.description),
  };
}

export function getFieldLabel(locale: Locale, field: ToolInputField): string {
  return localize(locale, field.labelKey, field.labelKey.split(".").pop() ?? field.id);
}

export function getFieldPlaceholder(locale: Locale, field: ToolInputField): string | undefined {
  if (field.placeholderKey === undefined) {
    return undefined;
  }
  const value = t(locale, field.placeholderKey as I18nKey);
  return value === field.placeholderKey ? undefined : value;
}

export function getOutputLabel(locale: Locale, output: ToolOutputField): string {
  return localize(locale, output.labelKey, output.labelKey.split(".").pop() ?? output.id);
}
