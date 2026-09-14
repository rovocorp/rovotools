import { assertNonNegative, assertPositive, roundTo } from "./guards";

export interface CompoundInterestInput {
  readonly principal: number;
  readonly annualRatePercent: number;
  readonly years: number;
  readonly compoundsPerYear: number;
}

export interface CompoundInterestResult {
  readonly futureValue: number;
  readonly interestEarned: number;
}

export interface SimpleInterestInput {
  readonly principal: number;
  readonly annualRatePercent: number;
  readonly years: number;
}

export interface RequiredRateInput {
  readonly presentValue: number;
  readonly futureValue: number;
  readonly years: number;
}

export function calculateCompoundInterest(input: CompoundInterestInput): CompoundInterestResult {
  assertNonNegative(input.principal, "principal");
  assertNonNegative(input.annualRatePercent, "annualRatePercent");
  assertNonNegative(input.years, "years");
  assertPositive(input.compoundsPerYear, "compoundsPerYear");
  if (!Number.isInteger(input.compoundsPerYear)) {
    throw new RangeError("compoundsPerYear must be an integer.");
  }

  const ratePerPeriod = input.annualRatePercent / 100 / input.compoundsPerYear;
  const periods = input.compoundsPerYear * input.years;
  const futureValue = roundTo(input.principal * Math.pow(1 + ratePerPeriod, periods), 2);
  return {
    futureValue,
    interestEarned: roundTo(futureValue - input.principal, 2),
  };
}

export function calculateSimpleInterest(input: SimpleInterestInput): CompoundInterestResult {
  assertNonNegative(input.principal, "principal");
  assertNonNegative(input.annualRatePercent, "annualRatePercent");
  assertNonNegative(input.years, "years");

  const interestEarned = roundTo(input.principal * (input.annualRatePercent / 100) * input.years, 2);
  return {
    futureValue: roundTo(input.principal + interestEarned, 2),
    interestEarned,
  };
}

export function calculateEffectiveAnnualRate(nominalRatePercent: number, compoundsPerYear: number): number {
  assertNonNegative(nominalRatePercent, "nominalRatePercent");
  assertPositive(compoundsPerYear, "compoundsPerYear");
  if (!Number.isInteger(compoundsPerYear)) {
    throw new RangeError("compoundsPerYear must be an integer.");
  }
  return roundTo(
    (Math.pow(1 + nominalRatePercent / 100 / compoundsPerYear, compoundsPerYear) - 1) * 100,
    4,
  );
}

export function calculateRequiredRate(input: RequiredRateInput): number {
  assertPositive(input.presentValue, "presentValue");
  assertPositive(input.futureValue, "futureValue");
  assertPositive(input.years, "years");
  return roundTo(
    (Math.pow(input.futureValue / input.presentValue, 1 / input.years) - 1) * 100,
    4,
  );
}
