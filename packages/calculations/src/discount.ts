import { assertNonNegative, assertPercentage, roundTo } from "./guards";

export interface DiscountInput {
  readonly price: number;
  readonly discountPercent: number;
}

export interface DiscountResult {
  readonly savings: number;
  readonly finalPrice: number;
  readonly discountPercent: number;
}

export function calculateDiscount(input: DiscountInput): DiscountResult {
  assertNonNegative(input.price, "price");
  assertPercentage(input.discountPercent, "discountPercent");

  const savings = roundTo((input.discountPercent / 100) * input.price, 2);
  return {
    savings,
    finalPrice: roundTo(input.price - savings, 2),
    discountPercent: input.discountPercent,
  };
}
