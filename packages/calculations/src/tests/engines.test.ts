import { describe, expect, it } from "vitest";

import { calculateAge } from "../age";
import { calculateAmortization } from "../amortization";
import { calculateBmi } from "../bmi";
import { calculateDebtPayoff } from "../debt";
import { calculateDiscount } from "../discount";
import { calculateInvestmentGrowth, calculateSavingsGrowth } from "../growth";
import { adjustForInflation, calculateInflation } from "../inflation";
import {
  calculateCompoundInterest,
  calculateEffectiveAnnualRate,
  calculateRequiredRate,
  calculateSimpleInterest,
} from "../interest";
import { calculateLoanPayment, calculateMortgagePayment } from "../loans";
import { percentageChange, percentageOf, valueFromPercentage } from "../percentage";
import { calculateRoi } from "../roi";
import { annualFromHourly, hourlyFromAnnual, paycheckAmount } from "../salary";
import { calculateTip } from "../tip";
import { convertLength, convertTemperature, convertWeight } from "../units";

describe("age", () => {
  it("calculates completed years, months, and days", () => {
    expect(calculateAge({ birthDate: "2000-01-15", asOfDate: "2026-09-11" })).toMatchObject({
      years: 26,
      months: 7,
      days: 27,
    });
  });

  it("handles leap-day birthdays", () => {
    expect(calculateAge({ birthDate: "2000-02-29", asOfDate: "2026-02-28" }).years).toBe(25);
  });

  it("rejects invalid or reversed dates", () => {
    expect(() => calculateAge({ birthDate: "2026-13-01", asOfDate: "2026-09-11" })).toThrow(
      RangeError,
    );
    expect(() => calculateAge({ birthDate: "2026-09-12", asOfDate: "2026-09-11" })).toThrow(
      RangeError,
    );
  });
});

describe("bmi", () => {
  it("computes a known BMI value and category", () => {
    expect(calculateBmi({ weightKg: 70, heightCm: 175 })).toMatchObject({
      bmi: 22.86,
      category: "normal",
    });
  });

  it("rejects non-positive measurements", () => {
    expect(() => calculateBmi({ weightKg: 70, heightCm: 0 })).toThrow(RangeError);
    expect(() => calculateBmi({ weightKg: -70, heightCm: 175 })).toThrow(RangeError);
  });
});

describe("percentage", () => {
  it("computes known percentage values", () => {
    expect(percentageOf(20, 200)).toBe(40);
    expect(valueFromPercentage(40, 200)).toBe(20);
    expect(percentageChange(50, 75)).toBe(50);
  });

  it("rejects zero denominators", () => {
    expect(() => valueFromPercentage(40, 0)).toThrow(RangeError);
    expect(() => percentageChange(0, 75)).toThrow(RangeError);
  });
});

describe("discount", () => {
  it("computes a known discounted price", () => {
    expect(calculateDiscount({ price: 100, discountPercent: 20 })).toEqual({
      savings: 20,
      finalPrice: 80,
      discountPercent: 20,
    });
  });

  it("rejects out-of-range discounts", () => {
    expect(() => calculateDiscount({ price: 100, discountPercent: 101 })).toThrow(RangeError);
  });
});

describe("unit conversion", () => {
  it("converts known length, weight, and temperature values", () => {
    expect(convertLength({ value: 1, from: "km", to: "m" })).toBe(1000);
    expect(convertLength({ value: 1, from: "mi", to: "km" })).toBeCloseTo(1.609344, 6);
    expect(convertWeight({ value: 1, from: "lb", to: "kg" })).toBeCloseTo(0.45359237, 8);
    expect(convertTemperature({ value: 32, from: "F", to: "C" })).toBeCloseTo(0, 10);
    expect(convertTemperature({ value: 0, from: "C", to: "K" })).toBeCloseTo(273.15, 10);
  });

  it("rejects temperatures below absolute zero", () => {
    expect(() => convertTemperature({ value: -300, from: "C", to: "K" })).toThrow(RangeError);
  });
});

describe("loan payment", () => {
  it("computes a known 30-year mortgage payment", () => {
    const result = calculateLoanPayment({ principal: 200000, annualRatePercent: 6.5, years: 30 });
    expect(result.monthlyPayment).toBeCloseTo(1264.14, 1);
    expect(result.numberOfPayments).toBe(360);
  });

  it("handles zero interest without division errors", () => {
    const result = calculateLoanPayment({ principal: 12000, annualRatePercent: 0, years: 1 });
    expect(result.monthlyPayment).toBe(1000);
    expect(result.totalInterest).toBe(0);
  });

  it("rejects invalid loan terms", () => {
    expect(() =>
      calculateLoanPayment({ principal: -1000, annualRatePercent: 5, years: 30 }),
    ).toThrow(RangeError);
    expect(() =>
      calculateLoanPayment({ principal: 1000, annualRatePercent: 5, years: 100 }),
    ).toThrow(RangeError);
  });
});

describe("mortgage payment", () => {
  it("adds escrow to principal and interest", () => {
    const result = calculateMortgagePayment({
      principal: 300000,
      annualRatePercent: 6,
      years: 30,
      annualPropertyTax: 3600,
      annualInsurance: 1200,
      monthlyPmi: 150,
    });
    expect(result.principalAndInterest).toBeCloseTo(1798.65, 1);
    expect(result.totalMonthlyPayment).toBeCloseTo(2348.65, 1);
  });
});

describe("amortization", () => {
  it("produces a balanced schedule with a zero closing balance", () => {
    const result = calculateAmortization({ principal: 10000, annualRatePercent: 12, years: 1 });
    expect(result.numberOfPayments).toBe(12);
    expect(result.schedule).toHaveLength(12);
    expect(result.schedule[11]?.balance).toBe(0);
    expect(result.totalInterest).toBeCloseTo(661.85, 0);
    expect(result.totalPayment).toBeCloseTo(result.monthlyPayment * 12, 0);
  });
});

describe("interest", () => {
  it("computes known compound and simple interest values", () => {
    expect(
      calculateCompoundInterest({
        principal: 10000,
        annualRatePercent: 7,
        years: 10,
        compoundsPerYear: 1,
      }).futureValue,
    ).toBeCloseTo(19671.51, 1);
    expect(
      calculateSimpleInterest({ principal: 5000, annualRatePercent: 5, years: 3 }),
    ).toEqual({ futureValue: 5750, interestEarned: 750 });
  });

  it("derives effective and required rates", () => {
    expect(calculateEffectiveAnnualRate(6, 12)).toBeCloseTo(6.1678, 2);
    expect(
      calculateRequiredRate({ presentValue: 10000, futureValue: 20000, years: 10 }),
    ).toBeCloseTo(7.1773, 2);
  });
});

describe("investment and savings growth", () => {
  it("grows annual investment contributions", () => {
    const result = calculateInvestmentGrowth({
      initialAmount: 0,
      annualContribution: 5000,
      annualRatePercent: 7,
      years: 10,
    });
    expect(result.futureValue).toBeCloseTo(69082.24, 0);
    expect(result.totalContributions).toBe(50000);
  });

  it("grows monthly savings contributions", () => {
    const result = calculateSavingsGrowth({
      initialAmount: 0,
      monthlyContribution: 200,
      annualRatePercent: 5,
      years: 1,
    });
    expect(result.futureValue).toBeCloseTo(2455.77, 0);
    expect(result.totalContributions).toBe(2400);
  });
});

describe("roi", () => {
  it("computes a known return on investment", () => {
    expect(calculateRoi({ cost: 10000, gain: 15000 })).toEqual({
      netProfit: 5000,
      roiPercent: 50,
    });
  });

  it("rejects zero cost", () => {
    expect(() => calculateRoi({ cost: 0, gain: 15000 })).toThrow(RangeError);
  });
});

describe("debt payoff", () => {
  it("pays a single debt with extra payments and no interest", () => {
    const result = calculateDebtPayoff({
      debts: [{ name: "Card", balance: 1000, annualRatePercent: 0, minimumPayment: 100 }],
      extraMonthlyPayment: 100,
      strategy: "avalanche",
    });
    expect(result).toMatchObject({ months: 5, totalInterest: 0, payoffOrder: ["Card"] });
  });

  it("orders avalanche by rate and snowball by balance", () => {
    const debts = [
      { name: "Low", balance: 5000, annualRatePercent: 5, minimumPayment: 100 },
      { name: "High", balance: 1000, annualRatePercent: 20, minimumPayment: 100 },
    ];
    const avalanche = calculateDebtPayoff({
      debts,
      extraMonthlyPayment: 500,
      strategy: "avalanche",
    });
    const snowball = calculateDebtPayoff({
      debts,
      extraMonthlyPayment: 500,
      strategy: "snowball",
    });
    expect(avalanche.payoffOrder[0]).toBe("High");
    expect(snowball.payoffOrder[0]).toBe("High");
    expect(avalanche.totalInterest).toBeLessThanOrEqual(snowball.totalInterest);
  });

  it("rejects payments that cannot cover interest", () => {
    expect(() =>
      calculateDebtPayoff({
        debts: [{ name: "Card", balance: 10000, annualRatePercent: 24, minimumPayment: 10 }],
        extraMonthlyPayment: 0,
        strategy: "avalanche",
      }),
    ).toThrow(RangeError);
  });
});

describe("inflation", () => {
  it("compounds a known inflated price", () => {
    expect(
      calculateInflation({ presentValue: 100, annualInflationPercent: 3, years: 10 }),
    ).toMatchObject({ futurePrice: 134.39 });
    expect(adjustForInflation(134.39, 3, 10)).toBeCloseTo(100, 1);
  });
});

describe("tip", () => {
  it("splits a known bill", () => {
    expect(calculateTip({ billAmount: 100, tipPercent: 15, people: 2 })).toEqual({
      tipAmount: 15,
      totalAmount: 115,
      perPerson: 57.5,
    });
  });

  it("rejects fractional people", () => {
    expect(() => calculateTip({ billAmount: 100, tipPercent: 15, people: 2.5 })).toThrow(
      RangeError,
    );
  });
});

describe("salary", () => {
  it("converts between hourly, annual, and paycheck amounts", () => {
    expect(annualFromHourly({ hourlyRate: 50, hoursPerWeek: 40, weeksPerYear: 52 })).toBe(104000);
    expect(hourlyFromAnnual({ grossAnnual: 104000, hoursPerWeek: 40, weeksPerYear: 52 })).toBe(50);
    expect(paycheckAmount({ grossAnnual: 104000, frequency: "monthly" })).toBeCloseTo(8666.67, 1);
  });

  it("rejects impossible work schedules", () => {
    expect(() =>
      annualFromHourly({ hourlyRate: 50, hoursPerWeek: 200, weeksPerYear: 52 }),
    ).toThrow(RangeError);
  });
});
