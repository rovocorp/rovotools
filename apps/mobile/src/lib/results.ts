import type { ToolOutputField } from "@rovotools/types";
import { getFieldLabel } from "@rovotools/tools";

function outputLabel(output: ToolOutputField): string {
  return getFieldLabel("en", {
    id: output.id,
    type: "string",
    labelKey: output.labelKey,
    required: false,
  });
}

export function formatResultsText(
  toolName: string,
  outputs: ReadonlyArray<ToolOutputField>,
  result: Record<string, unknown>,
): string {
  const lines = outputs.map(
    (output) => `${outputLabel(output)}: ${String(result[output.id] ?? "—")}`,
  );
  return `${toolName}\n${lines.join("\n")}`;
}

function escapeCsvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function resultsToCsv(
  outputs: ReadonlyArray<ToolOutputField>,
  result: Record<string, unknown>,
): string {
  const header = outputs
    .map((output) => escapeCsvCell(outputLabel(output)))
    .join(",");
  const row = outputs.map((output) => escapeCsvCell(String(result[output.id] ?? ""))).join(",");
  return `${header}\n${row}\n`;
}
