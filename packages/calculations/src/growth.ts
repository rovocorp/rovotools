import { assertNonNegative, roundTo } from "./guards";

export interface InvestmentGrowthInput {
  readonly initialAmount: number;
  readonly annualContribution: number;
  readonly annualRatePercent: number;
  readonly years: number;
}

export interface SavingsGrowthInput {
  readonly initialAmount: number;
  readonly monthlyContribution: number;
  readonly annualRatePercent: number;
  readonly years: number;
}

export interface GrowthResult {
  readonly futureValue: number;
  readonly totalContributions: number;
  readonly interestEarned: number;
}

function futureValueWithContributions(
  initialAmount: number,
  contributionPerPeriod: number,
  ratePerPeriod: number,
  periods: number,
): number {
  const grownPrincipal = initialAmount * Math.pow(1 + ratePerPeriod, periods);
  if (ratePerPeriod === 0) {
    return grownPrincipal + contributionPerPeriod * periods;
  }
  const annuityFactor = (Math.pow(1 + ratePerPeriod, periods) - 1) / ratePerPeriod;
  return grownPrincipal + contributionPerPeriod * annuityFactor;
}

export function calculateInvestmentGrowth(input: InvestmentGrowthInput): GrowthResult {
  assertNonNegative(input.initialAmount, "initialAmount");
  assertNonNegative(input.annualContribution, "annualContribution");
  assertNonNegative(input.annualRatePercent, "annualRatePercent");
  assertNonNegative(input.years, "years");

  const futureValue = roundTo(
    futureValueWithContributions(
      input.initialAmount,
      input.annualContribution,
      input.annualRatePercent / 100,
      input.years,
    ),
    2,
  );
  const totalContributions = roundTo(
    input.initialAmount + input.annualContribution * input.years,
    2,
  );
  return {
    futureValue,
    totalContributions,
    interestEarned: roundTo(futureValue - totalContributions, 2),
  };
}

export function calculateSavingsGrowth(input: SavingsGrowthInput): GrowthResult {
  assertNonNegative(input.initialAmount, "initialAmount");
  assertNonNegative(input.monthlyContribution, "monthlyContribution");
  assertNonNegative(input.annualRatePercent, "annualRatePercent");
  assertNonNegative(input.years, "years");

  const months = Math.round(input.years * 12);
  const futureValue = roundTo(
    futureValueWithContributions(
      input.initialAmount,
      input.monthlyContribution,
      input.annualRatePercent / 100 / 12,
      months,
    ),
    2,
  );
  const totalContributions = roundTo(input.initialAmount + input.monthlyContribution * months, 2);
  return {
    futureValue,
    totalContributions,
    interestEarned: roundTo(futureValue - totalContributions, 2),
  };
}
