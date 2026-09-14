import { assertFiniteNumber } from "./guards";

export function percentageOf(percent: number, total: number): number {
  assertFiniteNumber(percent, "percent");
  assertFiniteNumber(total, "total");
  return (percent / 100) * total;
}

export function valueFromPercentage(part: number, total: number): number {
  assertFiniteNumber(part, "part");
  assertFiniteNumber(total, "total");
  if (total === 0) {
    throw new RangeError("total must not be 0 when deriving a percentage.");
  }
  return (part / total) * 100;
}

export function percentageChange(oldValue: number, newValue: number): number {
  assertFiniteNumber(oldValue, "oldValue");
  assertFiniteNumber(newValue, "newValue");
  if (oldValue === 0) {
    throw new RangeError("oldValue must not be 0 when calculating percentage change.");
  }
  return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
}
