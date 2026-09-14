import { calculateAge } from "./age";
import { calculateAmortization } from "./amortization";
import { calculateBmi } from "./bmi";
import { calculateDebtPayoff } from "./debt";
import { calculateDiscount } from "./discount";
import { calculateInvestmentGrowth, calculateSavingsGrowth } from "./growth";
import { calculateInflation } from "./inflation";
import {
  calculateCompoundInterest,
  calculateEffectiveAnnualRate,
  calculateRequiredRate,
  calculateSimpleInterest,
} from "./interest";
import { calculateLoanPayment, calculateMortgagePayment } from "./loans";
import { percentageChange, percentageOf, valueFromPercentage } from "./percentage";
import { calculateRoi } from "./roi";
import { annualFromHourly, hourlyFromAnnual, paycheckAmount } from "./salary";
import { calculateTip } from "./tip";
import { convertLength, convertTemperature, convertWeight } from "./units";

export type EngineName =
  | "age"
  | "amortization"
  | "bmi"
  | "debt-payoff"
  | "discount"
  | "investment-growth"
  | "savings-growth"
  | "inflation"
  | "compound-interest"
  | "simple-interest"
  | "effective-rate"
  | "required-rate"
  | "loan-payment"
  | "mortgage-payment"
  | "percentage-of"
  | "percentage-change"
  | "value-from-percentage"
  | "roi"
  | "salary-annual"
  | "salary-hourly"
  | "salary-paycheck"
  | "tip"
  | "length"
  | "weight"
  | "temperature";

export interface CalculationVector {
  readonly engine: EngineName;
  readonly label: string;
  readonly input: Record<string, unknown>;
  readonly expected: Record<string, unknown>;
  readonly tolerance: number;
}

export interface InvalidVector {
  readonly engine: EngineName;
  readonly label: string;
  readonly input: Record<string, unknown>;
  readonly errorName: "RangeError" | "TypeError";
}

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return { value };
}

function num(input: Record<string, unknown>, key: string): number {
  const value = input[key];
  if (typeof value !== "number") {
    throw new TypeError(`Vector input "${key}" must be a number.`);
  }
  return value;
}

function str(input: Record<string, unknown>, key: string): string {
  const value = input[key];
  if (typeof value !== "string") {
    throw new TypeError(`Vector input "${key}" must be a string.`);
  }
  return value;
}

export function runVector(engine: EngineName, input: Record<string, unknown>): Record<string, unknown> {
  switch (engine) {
    case "age":
      return asRecord(calculateAge({ birthDate: str(input, "birthDate"), asOfDate: str(input, "asOfDate") }));
    case "amortization": {
      const result = calculateAmortization({
        principal: num(input, "principal"),
        annualRatePercent: num(input, "annualRatePercent"),
        years: num(input, "years"),
      });
      return {
        numberOfPayments: result.numberOfPayments,
        scheduleLength: result.schedule.length,
        finalBalance: result.schedule[result.schedule.length - 1]?.balance,
        totalInterest: result.totalInterest,
      };
    }
    case "bmi":
      return asRecord(calculateBmi({ weightKg: num(input, "weightKg"), heightCm: num(input, "heightCm") }));
    case "debt-payoff":
      return asRecord(
        calculateDebtPayoff({
          debts: input["debts"] as Array<{ name: string; balance: number; annualRatePercent: number; minimumPayment: number }>,
          extraMonthlyPayment: num(input, "extraMonthlyPayment"),
          strategy: input["strategy"] === "snowball" ? "snowball" : "avalanche",
        }),
      );
    case "discount":
      return asRecord(
        calculateDiscount({ price: num(input, "price"), discountPercent: num(input, "discountPercent") }),
      );
    case "investment-growth":
      return asRecord(
        calculateInvestmentGrowth({
          initialAmount: num(input, "initialAmount"),
          annualContribution: num(input, "annualContribution"),
          annualRatePercent: num(input, "annualRatePercent"),
          years: num(input, "years"),
        }),
      );
    case "savings-growth":
      return asRecord(
        calculateSavingsGrowth({
          initialAmount: num(input, "initialAmount"),
          monthlyContribution: num(input, "monthlyContribution"),
          annualRatePercent: num(input, "annualRatePercent"),
          years: num(input, "years"),
        }),
      );
    case "inflation":
      return asRecord(
        calculateInflation({
          presentValue: num(input, "presentValue"),
          annualInflationPercent: num(input, "annualInflationPercent"),
          years: num(input, "years"),
        }),
      );
    case "compound-interest":
      return asRecord(
        calculateCompoundInterest({
          principal: num(input, "principal"),
          annualRatePercent: num(input, "annualRatePercent"),
          years: num(input, "years"),
          compoundsPerYear: num(input, "compoundsPerYear"),
        }),
      );
    case "simple-interest":
      return asRecord(
        calculateSimpleInterest({
          principal: num(input, "principal"),
          annualRatePercent: num(input, "annualRatePercent"),
          years: num(input, "years"),
        }),
      );
    case "effective-rate":
      return { value: calculateEffectiveAnnualRate(num(input, "nominalRatePercent"), num(input, "compoundsPerYear")) };
    case "required-rate":
      return {
        value: calculateRequiredRate({
          presentValue: num(input, "presentValue"),
          futureValue: num(input, "futureValue"),
          years: num(input, "years"),
        }),
      };
    case "loan-payment":
      return asRecord(
        calculateLoanPayment({
          principal: num(input, "principal"),
          annualRatePercent: num(input, "annualRatePercent"),
          years: num(input, "years"),
        }),
      );
    case "mortgage-payment":
      return asRecord(
        calculateMortgagePayment({
          principal: num(input, "principal"),
          annualRatePercent: num(input, "annualRatePercent"),
          years: num(input, "years"),
          annualPropertyTax: num(input, "annualPropertyTax"),
          annualInsurance: num(input, "annualInsurance"),
          monthlyPmi: num(input, "monthlyPmi"),
        }),
      );
    case "percentage-of":
      return { value: percentageOf(num(input, "percent"), num(input, "total")) };
    case "percentage-change":
      return { value: percentageChange(num(input, "oldValue"), num(input, "newValue")) };
    case "value-from-percentage":
      return { value: valueFromPercentage(num(input, "part"), num(input, "total")) };
    case "roi":
      return asRecord(calculateRoi({ cost: num(input, "cost"), gain: num(input, "gain") }));
    case "salary-annual":
      return {
        value: annualFromHourly({
          hourlyRate: num(input, "hourlyRate"),
          hoursPerWeek: num(input, "hoursPerWeek"),
          weeksPerYear: num(input, "weeksPerYear"),
        }),
      };
    case "salary-hourly":
      return {
        value: hourlyFromAnnual({
          grossAnnual: num(input, "grossAnnual"),
          hoursPerWeek: num(input, "hoursPerWeek"),
          weeksPerYear: num(input, "weeksPerYear"),
        }),
      };
    case "salary-paycheck": {
      const frequency = str(input, "frequency");
      if (frequency !== "weekly" && frequency !== "biweekly" && frequency !== "semimonthly" && frequency !== "monthly") {
        throw new TypeError('Vector input "frequency" must be a pay frequency.');
      }
      return { value: paycheckAmount({ grossAnnual: num(input, "grossAnnual"), frequency }) };
    }
    case "tip":
      return asRecord(
        calculateTip({
          billAmount: num(input, "billAmount"),
          tipPercent: num(input, "tipPercent"),
          people: num(input, "people"),
        }),
      );
    case "length": {
      const from = str(input, "from");
      const to = str(input, "to");
      if (!isLengthUnit(from) || !isLengthUnit(to)) {
        throw new TypeError('Vector inputs "from"/"to" must be length units.');
      }
      return { value: convertLength({ value: num(input, "value"), from, to }) };
    }
    case "weight": {
      const from = str(input, "from");
      const to = str(input, "to");
      if (!isWeightUnit(from) || !isWeightUnit(to)) {
        throw new TypeError('Vector inputs "from"/"to" must be weight units.');
      }
      return { value: convertWeight({ value: num(input, "value"), from, to }) };
    }
    case "temperature": {
      const from = str(input, "from");
      const to = str(input, "to");
      if (!isTemperatureUnit(from) || !isTemperatureUnit(to)) {
        throw new TypeError('Vector inputs "from"/"to" must be temperature units.');
      }
      return { value: convertTemperature({ value: num(input, "value"), from, to }) };
    }
  }
}

function isLengthUnit(value: string): value is "mm" | "cm" | "m" | "km" | "in" | "ft" | "yd" | "mi" {
  return ["mm", "cm", "m", "km", "in", "ft", "yd", "mi"].includes(value);
}

function isWeightUnit(value: string): value is "mg" | "g" | "kg" | "oz" | "lb" | "t" {
  return ["mg", "g", "kg", "oz", "lb", "t"].includes(value);
}

function isTemperatureUnit(value: string): value is "C" | "F" | "K" {
  return ["C", "F", "K"].includes(value);
}

export function compareResult(
  actual: Record<string, unknown>,
  expected: Record<string, unknown>,
  tolerance: number,
): Array<string> {
  const mismatches: Array<string> = [];
  for (const key of Object.keys(expected)) {
    const want = expected[key];
    const got = actual[key];
    if (typeof want === "number" && typeof got === "number") {
      if (Math.abs(got - want) > tolerance) {
        mismatches.push(`${key}: got ${got}, want ${want} ± ${tolerance}`);
      }
    } else if (JSON.stringify(got) !== JSON.stringify(want)) {
      mismatches.push(`${key}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
    }
  }
  return mismatches;
}

export const CALCULATION_VECTORS: ReadonlyArray<CalculationVector> = [
  { engine: "age", label: "completed age", input: { birthDate: "2000-01-15", asOfDate: "2026-09-11" }, expected: { years: 26, months: 7, days: 27 }, tolerance: 0 },
  { engine: "bmi", label: "known BMI", input: { weightKg: 70, heightCm: 175 }, expected: { bmi: 22.86, category: "normal" }, tolerance: 0.005 },
  { engine: "percentage-of", label: "20% of 200", input: { percent: 20, total: 200 }, expected: { value: 40 }, tolerance: 0 },
  { engine: "percentage-change", label: "50 to 75", input: { oldValue: 50, newValue: 75 }, expected: { value: 50 }, tolerance: 0 },
  { engine: "value-from-percentage", label: "40 of 200", input: { part: 40, total: 200 }, expected: { value: 20 }, tolerance: 0 },
  { engine: "discount", label: "20% off 100", input: { price: 100, discountPercent: 20 }, expected: { savings: 20, finalPrice: 80, discountPercent: 20 }, tolerance: 0 },
  { engine: "length", label: "1 km to m", input: { value: 1, from: "km", to: "m" }, expected: { value: 1000 }, tolerance: 0 },
  { engine: "length", label: "1 mi to km", input: { value: 1, from: "mi", to: "km" }, expected: { value: 1.609344 }, tolerance: 0.000001 },
  { engine: "weight", label: "1 lb to kg", input: { value: 1, from: "lb", to: "kg" }, expected: { value: 0.45359237 }, tolerance: 0.00000001 },
  { engine: "temperature", label: "32F to C", input: { value: 32, from: "F", to: "C" }, expected: { value: 0 }, tolerance: 1e-9 },
  { engine: "temperature", label: "0C to K", input: { value: 0, from: "C", to: "K" }, expected: { value: 273.15 }, tolerance: 1e-9 },
  { engine: "loan-payment", label: "30-year mortgage", input: { principal: 200000, annualRatePercent: 6.5, years: 30 }, expected: { monthlyPayment: 1264.14, numberOfPayments: 360 }, tolerance: 0.05 },
  { engine: "mortgage-payment", label: "escrow adds up", input: { principal: 300000, annualRatePercent: 6, years: 30, annualPropertyTax: 3600, annualInsurance: 1200, monthlyPmi: 150 }, expected: { principalAndInterest: 1798.65, totalMonthlyPayment: 2348.65 }, tolerance: 0.05 },
  { engine: "amortization", label: "balanced 1-year schedule", input: { principal: 10000, annualRatePercent: 12, years: 1 }, expected: { numberOfPayments: 12, scheduleLength: 12, finalBalance: 0, totalInterest: 661.85 }, tolerance: 0.5 },
  { engine: "compound-interest", label: "10 years at 7%", input: { principal: 10000, annualRatePercent: 7, years: 10, compoundsPerYear: 1 }, expected: { futureValue: 19671.51 }, tolerance: 0.05 },
  { engine: "simple-interest", label: "5k at 5% for 3y", input: { principal: 5000, annualRatePercent: 5, years: 3 }, expected: { futureValue: 5750, interestEarned: 750 }, tolerance: 0 },
  { engine: "effective-rate", label: "6% nominal monthly", input: { nominalRatePercent: 6, compoundsPerYear: 12 }, expected: { value: 6.1678 }, tolerance: 0.0005 },
  { engine: "required-rate", label: "double in 10 years", input: { presentValue: 10000, futureValue: 20000, years: 10 }, expected: { value: 7.1773 }, tolerance: 0.005 },
  { engine: "investment-growth", label: "5k/year at 7% for 10y", input: { initialAmount: 0, annualContribution: 5000, annualRatePercent: 7, years: 10 }, expected: { futureValue: 69082.24, totalContributions: 50000 }, tolerance: 0.5 },
  { engine: "savings-growth", label: "200/mo at 5% for 1y", input: { initialAmount: 0, monthlyContribution: 200, annualRatePercent: 5, years: 1 }, expected: { futureValue: 2455.77, totalContributions: 2400 }, tolerance: 0.5 },
  { engine: "roi", label: "10k to 15k", input: { cost: 10000, gain: 15000 }, expected: { netProfit: 5000, roiPercent: 50 }, tolerance: 0 },
  { engine: "debt-payoff", label: "single debt avalanche", input: { debts: [{ name: "Card", balance: 1000, annualRatePercent: 0, minimumPayment: 100 }], extraMonthlyPayment: 100, strategy: "avalanche" }, expected: { months: 5, totalInterest: 0 }, tolerance: 0 },
  { engine: "inflation", label: "100 at 3% for 10y", input: { presentValue: 100, annualInflationPercent: 3, years: 10 }, expected: { futurePrice: 134.39 }, tolerance: 0.005 },
  { engine: "tip", label: "100 bill, 15%, 2 people", input: { billAmount: 100, tipPercent: 15, people: 2 }, expected: { tipAmount: 15, totalAmount: 115, perPerson: 57.5 }, tolerance: 0 },
  { engine: "salary-annual", label: "50/hr full time", input: { hourlyRate: 50, hoursPerWeek: 40, weeksPerYear: 52 }, expected: { value: 104000 }, tolerance: 0 },
  { engine: "salary-paycheck", label: "monthly paycheck", input: { grossAnnual: 104000, frequency: "monthly" }, expected: { value: 8666.67 }, tolerance: 0.01 },
];

export const INVALID_VECTORS: ReadonlyArray<InvalidVector> = [
  { engine: "bmi", label: "zero height", input: { weightKg: 70, heightCm: 0 }, errorName: "RangeError" },
  { engine: "loan-payment", label: "negative principal", input: { principal: -1000, annualRatePercent: 5, years: 30 }, errorName: "RangeError" },
  { engine: "tip", label: "fractional people", input: { billAmount: 100, tipPercent: 15, people: 2.5 }, errorName: "RangeError" },
  { engine: "temperature", label: "below absolute zero", input: { value: -300, from: "C", to: "K" }, errorName: "RangeError" },
  { engine: "roi", label: "zero cost", input: { cost: 0, gain: 15000 }, errorName: "RangeError" },
  { engine: "value-from-percentage", label: "zero total", input: { part: 40, total: 0 }, errorName: "RangeError" },
];

export function errorNameOf(error: unknown): string {
  return error instanceof Error ? error.name : typeof error;
}
