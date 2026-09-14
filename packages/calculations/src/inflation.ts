import { assertNonNegative, assertPositive, roundTo } from "./guards";

export interface InflationInput {
  readonly presentValue: number;
  readonly annualInflationPercent: number;
  readonly years: number;
}

export interface InflationResult {
  readonly futurePrice: number;
  readonly presentPurchasingPower: number;
}

export function calculateInflation(input: InflationInput): InflationResult {
  assertNonNegative(input.presentValue, "presentValue");
  assertNonNegative(input.annualInflationPercent, "annualInflationPercent");
  assertNonNegative(input.years, "years");

  const factor = Math.pow(1 + input.annualInflationPercent / 100, input.years);
  const futurePrice = roundTo(input.presentValue * factor, 2);
  return {
    futurePrice,
    presentPurchasingPower: factor === 0 ? 0 : roundTo(input.presentValue / factor, 2),
  };
}

export function adjustForInflation(
  futureValue: number,
  annualInflationPercent: number,
  years: number,
): number {
  assertNonNegative(futureValue, "futureValue");
  assertNonNegative(annualInflationPercent, "annualInflationPercent");
  assertNonNegative(years, "years");
  assertPositive(1 + annualInflationPercent / 100, "inflation factor");
  return roundTo(
    futureValue / Math.pow(1 + annualInflationPercent / 100, years),
    2,
  );
}
