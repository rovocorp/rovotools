import { roundTo } from "./guards";
import { calculateLoanPayment, type LoanInput } from "./loans";

export interface AmortizationRow {
  readonly paymentNumber: number;
  readonly payment: number;
  readonly principal: number;
  readonly interest: number;
  readonly balance: number;
}

export interface AmortizationResult {
  readonly monthlyPayment: number;
  readonly numberOfPayments: number;
  readonly totalPayment: number;
  readonly totalInterest: number;
  readonly schedule: ReadonlyArray<AmortizationRow>;
}

export function calculateAmortization(input: LoanInput): AmortizationResult {
  const loan = calculateLoanPayment(input);
  const monthlyRate = input.annualRatePercent / 100 / 12;
  const schedule: AmortizationRow[] = [];
  let balance = input.principal;
  let totalInterest = 0;

  for (let paymentNumber = 1; paymentNumber <= loan.numberOfPayments; paymentNumber += 1) {
    const interest = roundTo(balance * monthlyRate, 2);
    let payment = loan.monthlyPayment;
    let principal = roundTo(payment - interest, 2);
    if (principal >= balance || paymentNumber === loan.numberOfPayments) {
      principal = roundTo(balance, 2);
      payment = roundTo(principal + interest, 2);
    }
    balance = roundTo(balance - principal, 2);
    totalInterest = roundTo(totalInterest + interest, 2);
    schedule.push({ paymentNumber, payment, principal, interest, balance });
    if (balance <= 0) {
      break;
    }
  }

  const totalPayment = roundTo(
    schedule.reduce((total, row) => total + row.payment, 0),
    2,
  );
  return {
    monthlyPayment: loan.monthlyPayment,
    numberOfPayments: schedule.length,
    totalPayment,
    totalInterest,
    schedule,
  };
}
