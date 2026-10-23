import { describe, expect, it } from "vitest";
import { Prisma } from "@prisma/client";

import { calculatePayslip } from "@/features/payroll/calculate-payslip";

const money = (amount: number) => new Prisma.Decimal(amount);

describe("calculatePayslip", () => {
  it("adds base salary and allowances when there are no absences", () => {
    const result = calculatePayslip({ baseSalary: money(1_500_000), allowances: money(250_000), absentDays: 0, unpaidLeaveDays: 0 });

    expect(result.absenceDeduction.toNumber()).toBe(0);
    expect(result.netSalary.toNumber()).toBe(1_750_000);
  });

  it("deducts one day of base salary for every absent or unpaid day", () => {
    // Daily rate = 1,500,000 / 30 = 50,000
    const result = calculatePayslip({ baseSalary: money(1_500_000), allowances: money(0), absentDays: 2, unpaidLeaveDays: 1 });

    expect(result.absenceDeduction.toNumber()).toBe(150_000);
    expect(result.netSalary.toNumber()).toBe(1_350_000);
  });

  it("includes bonus and other deductions", () => {
    const result = calculatePayslip({
      baseSalary: money(1_000_000),
      allowances: money(100_000),
      absentDays: 0,
      unpaidLeaveDays: 0,
      bonus: money(200_000),
      otherDeductions: money(50_000),
    });

    expect(result.netSalary.toNumber()).toBe(1_250_000);
  });

  it("never returns a negative salary", () => {
    const result = calculatePayslip({ baseSalary: money(300_000), allowances: money(0), absentDays: 30, unpaidLeaveDays: 5 });

    expect(result.netSalary.toNumber()).toBe(0);
  });

  it("does not have floating point errors", () => {
    const result = calculatePayslip({ baseSalary: money(0.1), allowances: money(0.2), absentDays: 0, unpaidLeaveDays: 0 });

    expect(result.netSalary.toString()).toBe("0.3");
  });
});
