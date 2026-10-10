export interface ParsedFlexibleDate {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly time: number;
}

export interface DateDifferenceInput {
  readonly from: string;
  readonly to: string;
}

export interface DateDifferenceResult {
  readonly years: number;
  readonly months: number;
  readonly days: number;
  readonly totalDays: number;
  readonly weeks: number;
  readonly monthsApprox: string;
  readonly breakdown: string;
}

const MS_PER_DAY = 86_400_000;

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function checkParts(year: number, month: number, day: number, name: string): ParsedFlexibleDate {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    throw new RangeError(`${name} must use DD-MM-YYYY, DD/MM/YYYY or YYYY-MM-DD format.`);
  }
  if (month < 1 || month > 12) {
    throw new RangeError(`${name} contains an invalid month.`);
  }
  const maxDay = daysInMonth(year, month);
  if (day < 1 || day > maxDay) {
    throw new RangeError(`${name} contains an invalid day.`);
  }
  return { year, month, day, time: Date.UTC(year, month - 1, day) };
}

/**
 * Accepts DD-MM-YYYY, DD/MM/YYYY (day first, per tool spec) and YYYY-MM-DD.
 * Day/month may be 1-2 digits; year must be 4 digits. Strict calendar check.
 */
export function parseFlexibleDate(value: string, name: string): ParsedFlexibleDate {
  const raw = value.trim();
  if (raw === "") {
    throw new RangeError(`${name} must use DD-MM-YYYY, DD/MM/YYYY or YYYY-MM-DD format.`);
  }
  let match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(raw);
  if (match?.[1] !== undefined && match[2] !== undefined && match[3] !== undefined) {
    return checkParts(Number(match[1]), Number(match[2]), Number(match[3]), name);
  }
  match = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/.exec(raw);
  if (match?.[1] !== undefined && match[2] !== undefined && match[3] !== undefined) {
    return checkParts(Number(match[3]), Number(match[2]), Number(match[1]), name);
  }
  throw new RangeError(`${name} must use DD-MM-YYYY, DD/MM/YYYY or YYYY-MM-DD format.`);
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export function formatDDMMYYYY(parsed: ParsedFlexibleDate): string {
  return `${pad2(parsed.day)}-${pad2(parsed.month)}-${parsed.year}`;
}

/** Display/normalized form for date widgets: DD/MM/YYYY (slashes). */
export function formatSlashDDMMYYYY(parsed: ParsedFlexibleDate): string {
  return `${pad2(parsed.day)}/${pad2(parsed.month)}/${parsed.year}`;
}

/** Today's local date formatted as DD/MM/YYYY for "calculate as of today" defaults. */
export function todaySlashDDMMYYYY(now: Date = new Date()): string {
  return formatSlashDDMMYYYY({ year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate(), time: 0 });
}

export function toIsoDate(parsed: ParsedFlexibleDate): string {
  return `${parsed.year}-${pad2(parsed.month)}-${pad2(parsed.day)}`;
}

/** Tries to parse; returns null instead of throwing (for UI display logic). */
export function tryParseFlexibleDate(value: string): ParsedFlexibleDate | null {
  try {
    return parseFlexibleDate(value, "date");
  } catch {
    return null;
  }
}

function plural(count: number, singular: string): string {
  return `${count} ${singular}${count === 1 ? "" : "s"}`;
}

/**
 * Directed calendar-accurate difference (age-like). Throws when `to` is
 * before `from` so the UI can show the wrong-date message.
 */
export function calculateDateDifference(input: DateDifferenceInput): DateDifferenceResult {
  const from = parseFlexibleDate(input.from, "from");
  const to = parseFlexibleDate(input.to, "to");
  if (to.time < from.time) {
    throw new RangeError("To date must be on or after From date.");
  }
  let years = to.year - from.year;
  let months = to.month - from.month;
  let days = to.day - from.day;
  if (days < 0) {
    const previousMonth = to.month === 1 ? 12 : to.month - 1;
    const previousYear = to.month === 1 ? to.year - 1 : to.year;
    days += daysInMonth(previousYear, previousMonth);
    months -= 1;
  }
  if (months < 0) {
    months += 12;
    years -= 1;
  }
  const totalDays = Math.round((to.time - from.time) / MS_PER_DAY);
  return {
    years,
    months,
    days,
    totalDays,
    weeks: Math.floor(totalDays / 7),
    monthsApprox: String(Math.round((totalDays / 30.44) * 10) / 10),
    breakdown: `${plural(years, "year")}, ${plural(months, "month")}, ${plural(days, "day")}`,
  };
}
