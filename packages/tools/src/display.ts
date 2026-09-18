import { t, type I18nKey, type Locale } from "@rovotools/localization";
import type { ToolDefinition, ToolInputField, ToolOutputField } from "@rovotools/types";

function localize(locale: Locale, key: string, fallback: string): string {
  const value = t(locale, key as I18nKey);
  return value === key ? fallback : value;
}

/**
 * Fallback when a labelKey has no translation: dotted key paths
 * ("tools.bmi.weight") collapse to their last segment, but literal
 * display text ("India (GST)", "14.975%") is returned verbatim —
 * verbatim — splitting it on "." would mangle decimals into fragments
 * like "975%".
 */
function fallbackLabel(key: string, id: string): string {
  if (/^[A-Za-z0-9_.-]+$/.test(key)) {
    return key.split(".").pop() ?? id;
  }
  return key;
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
  return localize(locale, field.labelKey, fallbackLabel(field.labelKey, field.id));
}

export function getFieldPlaceholder(locale: Locale, field: ToolInputField): string | undefined {
  if (field.placeholderKey === undefined) {
    return undefined;
  }
  const value = t(locale, field.placeholderKey as I18nKey);
  return value === field.placeholderKey ? undefined : value;
}

export function getOutputLabel(locale: Locale, output: ToolOutputField): string {
  return localize(locale, output.labelKey, fallbackLabel(output.labelKey, output.id));
}
