"use client";

import { useState } from "react";
import { formatSlashDDMMYYYY, toIsoDate, tryParseFlexibleDate } from "@/shared/calculations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DateInputProps {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly required?: boolean;
}

/**
 * Hybrid date field: free-text manual entry (DD/MM/YYYY, DD-MM-YYYY,
 * YYYY-MM-DD) plus a native calendar picker that writes back normalized
 * DD/MM/YYYY. Shows the normalized form when not editing.
 *
 * Typing digits auto-inserts "/" after DD and MM (maskSlashDate), so
 * typing 1 5 0 1 1 9 9 0 yields 15/01/1990 with no extra keystrokes.
 * Year-first ISO entry (1990-â€¦) is left alone and normalized on blur.
 */
export function maskSlashDate(raw: string): string {
  if (raw === "") {
    return "";
  }
  if (/^\d{4}-/.test(raw)) {
    // Year-first ISO entry (1990-01-15): leave alone, normalize on blur.
    return raw;
  }
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  const unexpected = raw.replace(/[\d/\-. ]/g, "");
  if (unexpected !== "" || digits === "") {
    // Letters or other text: pass through untouched.
    return raw;
  }
  if (digits.length <= 2) {
    return digits;
  }
  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}
export default function DateInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  required,
}: DateInputProps): React.ReactElement {
  const [focused, setFocused] = useState(false);
  const parsed = tryParseFlexibleDate(value);
  const display = focused === false && parsed !== null ? formatSlashDDMMYYYY(parsed) : value;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2">
        <Input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={display}
          placeholder={placeholder ?? "DD/MM/YYYY"}
          required={required}
          onChange={(event) => onChange(maskSlashDate(event.target.value))}
          onFocus={() => setFocused(true)}
          onBlur={(event) => {
            setFocused(false);
            const next = tryParseFlexibleDate(event.target.value);
            if (next !== null) {
              const normalized = formatSlashDDMMYYYY(next);
              if (normalized !== event.target.value) {
                onChange(normalized);
              }
            }
          }}
          className="flex-1"
        />
        <Input
          id={`${id}-picker`}
          type="date"
          aria-label={`Pick ${label} from calendar`}
          value={parsed !== null ? toIsoDate(parsed) : ""}
          onChange={(event) => {
            const next = tryParseFlexibleDate(event.target.value);
            if (next !== null) {
              onChange(formatSlashDDMMYYYY(next));
            }
          }}
          className="w-[9.5rem] shrink-0"
        />
      </div>
    </div>
  );
}
