import { Prisma } from "@prisma/client";

/** We use a fixed 30-day month to find the salary of one day. */
export const DAYS_PER_MONTH_FOR_PAY = 30;

type PayslipInput = {
  baseSalary: Prisma.Decimal;
  allowances: Prisma.Decimal;
  absentDays: number;
  unpaidLeaveDays: number;
  bonus?: Prisma.Decimal;
  otherDeductions?: Prisma.Decimal;
};

/**
 * net = base + allowances + bonus − (unpaid days × daily rate) − other deductions
 *
 * Money is calculated with Decimal, never with normal JS numbers,
 * because 0.1 + 0.2 !== 0.3 in JavaScript.
 */
export function calculatePayslip(input: PayslipInput) {
  const bonus = input.bonus ?? new Prisma.Decimal(0);
  const otherDeductions = input.otherDeductions ?? new Prisma.Decimal(0);

  const dailyRate = input.baseSalary.dividedBy(DAYS_PER_MONTH_FOR_PAY);
  const unpaidDays = input.absentDays + input.unpaidLeaveDays;
  const absenceDeduction = dailyRate.times(unpaidDays).toDecimalPlaces(2);

  const grossSalary = input.baseSalary.plus(input.allowances).plus(bonus);
  const netSalary = grossSalary.minus(absenceDeduction).minus(otherDeductions);

  return {
    absenceDeduction,
    // Salary can never go below zero.
    netSalary: Prisma.Decimal.max(netSalary, 0).toDecimalPlaces(2),
  };
}
