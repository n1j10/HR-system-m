import { prisma } from "@/lib/prisma";
import { getMonthRange } from "@/lib/dates";
import { getHolidaysBetween } from "@/features/holidays/queries";
import { getWorkingDates } from "@/features/leaves/leave-days";

export async function getPayrollRuns() {
  const payrollRuns = await prisma.payrollRun.findMany({
    orderBy: [{ year: "desc" }, { month: "desc" }],
    include: { payslips: { select: { netSalary: true, currency: true } } },
  });

  return payrollRuns.map((payrollRun) => ({
    ...payrollRun,
    employeeCount: payrollRun.payslips.length,
    totalNetIqd: payrollRun.payslips
      .filter((payslip) => payslip.currency === "IQD")
      .reduce((total, payslip) => total + Number(payslip.netSalary), 0),
    totalNetUsd: payrollRun.payslips
      .filter((payslip) => payslip.currency === "USD")
      .reduce((total, payslip) => total + Number(payslip.netSalary), 0),
  }));
}

export async function getPayrollRunWithPayslips(payrollRunId: string) {
  return prisma.payrollRun.findUnique({
    where: { id: payrollRunId },
    include: {
      payslips: {
        orderBy: { employee: { firstName: "asc" } },
        include: {
          employee: {
            select: { firstName: true, lastName: true, employeeNumber: true, bankName: true, bankAccount: true, department: { select: { name: true } } },
          },
        },
      },
    },
  });
}

/** Employees only see payslips after HR approved the month. */
export async function getMyPayslips(employeeId: string) {
  return prisma.payslip.findMany({
    where: { employeeId, payrollRun: { status: { in: ["APPROVED", "PAID"] } } },
    orderBy: [{ payrollRun: { year: "desc" } }, { payrollRun: { month: "desc" } }],
    include: { payrollRun: true },
  });
}

export async function getPayslipWithDetails(payslipId: string) {
  return prisma.payslip.findUnique({
    where: { id: payslipId },
    include: {
      payrollRun: true,
      employee: { include: { department: true, position: true } },
    },
  });
}

/** Counts unpaid-leave work days that fall inside the given month. */
export async function countUnpaidLeaveDaysInMonth(employeeId: string, month: number, year: number) {
  const { firstDay, lastDay } = getMonthRange(month, year);

  const unpaidLeaves = await prisma.leaveRequest.findMany({
    where: {
      employeeId,
      status: "APPROVED",
      leaveType: { isPaid: false },
      startDate: { lte: lastDay },
      endDate: { gte: firstDay },
    },
  });
  if (unpaidLeaves.length === 0) return 0;

  const holidays = await getHolidaysBetween(firstDay, lastDay);
  const holidayDates = holidays.map((holiday) => holiday.date);

  let unpaidDays = 0;
  for (const leave of unpaidLeaves) {
    // Only count the part of the leave that is inside this month.
    const startInsideMonth = leave.startDate > firstDay ? leave.startDate : firstDay;
    const endInsideMonth = leave.endDate < lastDay ? leave.endDate : lastDay;
    unpaidDays += getWorkingDates(startInsideMonth, endInsideMonth, holidayDates).length;
  }
  return unpaidDays;
}
