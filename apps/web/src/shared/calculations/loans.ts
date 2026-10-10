import { assertNonNegative, assertPositive, roundTo } from "./guards";

export interface LoanInput {
  readonly principal: number;
  readonly annualRatePercent: number;
  readonly years: number;
}

export interface LoanPaymentResult {
  readonly monthlyPayment: number;
  readonly numberOfPayments: number;
  readonly totalPayment: number;
  readonly totalInterest: number;
}

export interface MortgageInput extends LoanInput {
  readonly annualPropertyTax?: number;
  readonly annualInsurance?: number;
  readonly monthlyPmi?: number;
}

export interface MortgagePaymentResult extends LoanPaymentResult {
  readonly principalAndInterest: number;
  readonly monthlyTax: number;
  readonly monthlyInsurance: number;
  readonly monthlyPmi: number;
  readonly totalMonthlyPayment: number;
}

const MONTHS_PER_YEAR = 12;

function paymentCount(years: number): number {
  assertPositive(years, "years");
  if (!Number.isInteger(years * MONTHS_PER_YEAR)) {
    throw new RangeError("years must resolve to a whole number of monthly payments.");
  }
  const count = Math.round(years * MONTHS_PER_YEAR);
  if (count < 1 || count > 600) {
    throw new RangeError("years must produce between 1 and 600 monthly payments.");
  }
  return count;
}

export function calculateLoanPayment(input: LoanInput): LoanPaymentResult {
  assertPositive(input.principal, "principal");
  assertNonNegative(input.annualRatePercent, "annualRatePercent");
  const numberOfPayments = paymentCount(input.years);

  if (input.annualRatePercent === 0) {
    const monthlyPayment = roundTo(input.principal / numberOfPayments, 2);
    return {
      monthlyPayment,
      numberOfPayments,
      totalPayment: roundTo(monthlyPayment * numberOfPayments, 2),
      totalInterest: 0,
    };
  }

  const monthlyRate = input.annualRatePercent / 100 / MONTHS_PER_YEAR;
  const factor = Math.pow(1 + monthlyRate, numberOfPayments);
  const monthlyPayment = roundTo(
    (input.principal * monthlyRate * factor) / (factor - 1),
    2,
  );
  const totalPayment = roundTo(monthlyPayment * numberOfPayments, 2);
  return {
    monthlyPayment,
    numberOfPayments,
    totalPayment,
    totalInterest: roundTo(totalPayment - input.principal, 2),
  };
}

export function calculateMortgagePayment(input: MortgageInput): MortgagePaymentResult {
  const loan = calculateLoanPayment(input);
  const monthlyTax = roundTo((input.annualPropertyTax ?? 0) / MONTHS_PER_YEAR, 2);
  const monthlyInsurance = roundTo((input.annualInsurance ?? 0) / MONTHS_PER_YEAR, 2);
  const monthlyPmi = roundTo(input.monthlyPmi ?? 0, 2);
  if (monthlyTax < 0 || monthlyInsurance < 0 || monthlyPmi < 0) {
    throw new RangeError("Mortgage escrow amounts must be greater than or equal to 0.");
  }

  return {
    ...loan,
    principalAndInterest: loan.monthlyPayment,
    monthlyTax,
    monthlyInsurance,
    monthlyPmi,
    totalMonthlyPayment: roundTo(
      loan.monthlyPayment + monthlyTax + monthlyInsurance + monthlyPmi,
      2,
    ),
  };
}
