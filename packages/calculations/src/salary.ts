import { assertNonNegative, assertPositive, roundTo } from "./guards";

export type PayFrequency = "weekly" | "biweekly" | "semimonthly" | "monthly";

const PAYCHECKS_PER_YEAR: Record<PayFrequency, number> = {
  weekly: 52,
  biweekly: 26,
  semimonthly: 24,
  monthly: 12,
};

export interface HourlyToAnnualInput {
  readonly hourlyRate: number;
  readonly hoursPerWeek: number;
  readonly weeksPerYear: number;
}

export interface AnnualToHourlyInput {
  readonly grossAnnual: number;
  readonly hoursPerWeek: number;
  readonly weeksPerYear: number;
}

export interface PaycheckInput {
  readonly grossAnnual: number;
  readonly frequency: PayFrequency;
}

export function annualFromHourly(input: HourlyToAnnualInput): number {
  assertNonNegative(input.hourlyRate, "hourlyRate");
  assertNonNegative(input.hoursPerWeek, "hoursPerWeek");
  assertNonNegative(input.weeksPerYear, "weeksPerYear");
  if (input.hoursPerWeek > 168) {
    throw new RangeError("hoursPerWeek cannot exceed 168.");
  }
  if (input.weeksPerYear > 52) {
    throw new RangeError("weeksPerYear cannot exceed 52.");
  }
  return roundTo(input.hourlyRate * input.hoursPerWeek * input.weeksPerYear, 2);
}

export function hourlyFromAnnual(input: AnnualToHourlyInput): number {
  assertNonNegative(input.grossAnnual, "grossAnnual");
  assertPositive(input.hoursPerWeek, "hoursPerWeek");
  assertPositive(input.weeksPerYear, "weeksPerYear");
  return roundTo(input.grossAnnual / (input.hoursPerWeek * input.weeksPerYear), 2);
}

export function paycheckAmount(input: PaycheckInput): number {
  assertNonNegative(input.grossAnnual, "grossAnnual");
  return roundTo(input.grossAnnual / PAYCHECKS_PER_YEAR[input.frequency], 2);
}
