import { assertNonEmptyString, assertNonNegative, assertPositive, roundTo } from "./guards";

export type DebtPayoffStrategy = "avalanche" | "snowball";

export interface DebtInput {
  readonly name: string;
  readonly balance: number;
  readonly annualRatePercent: number;
  readonly minimumPayment: number;
}

export interface DebtPayoffInput {
  readonly debts: ReadonlyArray<DebtInput>;
  readonly extraMonthlyPayment: number;
  readonly strategy: DebtPayoffStrategy;
}

export interface DebtPayoffResult {
  readonly months: number;
  readonly totalPaid: number;
  readonly totalInterest: number;
  readonly payoffOrder: ReadonlyArray<string>;
}

interface MutableDebt {
  readonly name: string;
  readonly annualRatePercent: number;
  readonly minimumPayment: number;
  balance: number;
  paid: boolean;
}

const MAX_MONTHS = 1200;

function orderDebts(debts: MutableDebt[], strategy: DebtPayoffStrategy): void {
  debts.sort((a, b) => {
    if (strategy === "avalanche") {
      if (b.annualRatePercent !== a.annualRatePercent) {
        return b.annualRatePercent - a.annualRatePercent;
      }
      return a.balance - b.balance;
    }
    if (a.balance !== b.balance) {
      return a.balance - b.balance;
    }
    return b.annualRatePercent - a.annualRatePercent;
  });
}

export function calculateDebtPayoff(input: DebtPayoffInput): DebtPayoffResult {
  if (input.debts.length === 0) {
    throw new RangeError("debts must contain at least one debt.");
  }
  assertNonNegative(input.extraMonthlyPayment, "extraMonthlyPayment");

  const debts: MutableDebt[] = input.debts.map((debt) => {
    assertNonEmptyString(debt.name, "debt.name");
    assertPositive(debt.balance, "debt.balance");
    assertNonNegative(debt.annualRatePercent, "debt.annualRatePercent");
    assertPositive(debt.minimumPayment, "debt.minimumPayment");
    return {
      name: debt.name,
      annualRatePercent: debt.annualRatePercent,
      minimumPayment: debt.minimumPayment,
      balance: debt.balance,
      paid: false,
    };
  });

  const firstMonthInterest = debts.reduce(
    (total, debt) => total + (debt.balance * debt.annualRatePercent) / 100 / 12,
    0,
  );
  const monthlyBudget =
    debts.reduce((total, debt) => total + debt.minimumPayment, 0) + input.extraMonthlyPayment;
  if (monthlyBudget <= firstMonthInterest) {
    throw new RangeError("Monthly payments must exceed the monthly interest charge.");
  }

  orderDebts(debts, input.strategy);
  const payoffOrder: string[] = [];
  let totalPaid = 0;
  let totalInterest = 0;
  let months = 0;

  while (debts.some((debt) => !debt.paid)) {
    if (months >= MAX_MONTHS) {
      throw new RangeError("Debt payoff did not complete within 1200 months.");
    }
    months += 1;

    for (const debt of debts) {
      if (!debt.paid) {
        const interest = roundTo((debt.balance * debt.annualRatePercent) / 100 / 12, 2);
        debt.balance = roundTo(debt.balance + interest, 2);
        totalInterest = roundTo(totalInterest + interest, 2);
      }
    }

    let remainingBudget = roundTo(monthlyBudget, 2);
    for (const debt of debts) {
      if (debt.paid || remainingBudget <= 0) {
        continue;
      }
      const payment = Math.min(debt.minimumPayment, debt.balance, remainingBudget);
      debt.balance = roundTo(debt.balance - payment, 2);
      remainingBudget = roundTo(remainingBudget - payment, 2);
      totalPaid = roundTo(totalPaid + payment, 2);
      if (debt.balance <= 0) {
        debt.paid = true;
        payoffOrder.push(debt.name);
      }
    }

    for (const debt of debts) {
      if (debt.paid || remainingBudget <= 0) {
        continue;
      }
      const payment = Math.min(debt.balance, remainingBudget);
      debt.balance = roundTo(debt.balance - payment, 2);
      remainingBudget = roundTo(remainingBudget - payment, 2);
      totalPaid = roundTo(totalPaid + payment, 2);
      if (debt.balance <= 0) {
        debt.paid = true;
        payoffOrder.push(debt.name);
      }
    }
  }

  return {
    months,
    totalPaid,
    totalInterest,
    payoffOrder,
  };
}
