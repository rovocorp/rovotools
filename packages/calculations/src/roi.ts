import { assertFiniteNumber, assertPositive, roundTo } from "./guards";

export interface RoiInput {
  readonly cost: number;
  readonly gain: number;
}

export interface RoiResult {
  readonly netProfit: number;
  readonly roiPercent: number;
}

export function calculateRoi(input: RoiInput): RoiResult {
  assertPositive(input.cost, "cost");
  assertFiniteNumber(input.gain, "gain");

  const netProfit = roundTo(input.gain - input.cost, 2);
  return {
    netProfit,
    roiPercent: roundTo((netProfit / input.cost) * 100, 2),
  };
}
