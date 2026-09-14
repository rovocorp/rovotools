import { assertNonNegative, assertPercentage, assertPositive, roundTo } from "./guards";

export interface TipInput {
  readonly billAmount: number;
  readonly tipPercent: number;
  readonly people: number;
}

export interface TipResult {
  readonly tipAmount: number;
  readonly totalAmount: number;
  readonly perPerson: number;
}

export function calculateTip(input: TipInput): TipResult {
  assertNonNegative(input.billAmount, "billAmount");
  assertPercentage(input.tipPercent, "tipPercent");
  assertPositive(input.people, "people");
  if (!Number.isInteger(input.people)) {
    throw new RangeError("people must be an integer.");
  }

  const tipAmount = roundTo((input.tipPercent / 100) * input.billAmount, 2);
  const totalAmount = roundTo(input.billAmount + tipAmount, 2);
  return {
    tipAmount,
    totalAmount,
    perPerson: roundTo(totalAmount / input.people, 2),
  };
}
