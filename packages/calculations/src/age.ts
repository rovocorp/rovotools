import { parseIsoDate } from "./guards";

export interface AgeInput {
  readonly birthDate: string;
  readonly asOfDate: string;
}

export interface AgeResult {
  readonly years: number;
  readonly months: number;
  readonly days: number;
  readonly totalDays: number;
}

const MS_PER_DAY = 86_400_000;

export function calculateAge(input: AgeInput): AgeResult {
  const birth = parseIsoDate(input.birthDate, "birthDate");
  const asOf = parseIsoDate(input.asOfDate, "asOfDate");
  if (asOf.time < birth.time) {
    throw new RangeError("asOfDate must be on or after birthDate.");
  }

  let years = asOf.year - birth.year;
  let months = asOf.month - birth.month;
  let days = asOf.day - birth.day;

  if (days < 0) {
    const previousMonth = asOf.month === 1 ? 12 : asOf.month - 1;
    const previousYear = asOf.month === 1 ? asOf.year - 1 : asOf.year;
    const daysInPreviousMonth = new Date(Date.UTC(previousYear, previousMonth, 0)).getUTCDate();
    days += daysInPreviousMonth;
    months -= 1;
  }
  if (months < 0) {
    months += 12;
    years -= 1;
  }

  return {
    years,
    months,
    days,
    totalDays: Math.round((asOf.time - birth.time) / MS_PER_DAY),
  };
}
