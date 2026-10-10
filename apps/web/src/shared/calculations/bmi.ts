import { assertPositive, roundTo } from "./guards";

export type BmiCategory = "underweight" | "normal" | "overweight" | "obesity";

export interface BmiInput {
  readonly weightKg: number;
  readonly heightCm: number;
}

export interface BmiResult {
  readonly bmi: number;
  readonly category: BmiCategory;
  readonly healthyWeightMinKg: number;
  readonly healthyWeightMaxKg: number;
}

export function calculateBmi(input: BmiInput): BmiResult {
  assertPositive(input.weightKg, "weightKg");
  assertPositive(input.heightCm, "heightCm");

  const heightM = input.heightCm / 100;
  const bmi = roundTo(input.weightKg / (heightM * heightM), 2);
  const category: BmiCategory =
    bmi < 18.5 ? "underweight" : bmi < 25 ? "normal" : bmi < 30 ? "overweight" : "obesity";

  return {
    bmi,
    category,
    healthyWeightMinKg: roundTo(18.5 * heightM * heightM, 1),
    healthyWeightMaxKg: roundTo(24.9 * heightM * heightM, 1),
  };
}
