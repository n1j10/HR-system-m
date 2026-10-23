"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { getMonthRange } from "@/lib/dates";
import { MONTH_NAMES } from "@/lib/format";
import { formDataToObject } from "@/lib/validation";
import { errorResult, successResult, validationErrorResult, type ActionResult } from "@/lib/action-result";
import { calculatePayslip } from "@/features/payroll/calculate-payslip";
import { countUnpaidLeaveDaysInMonth } from "@/features/payroll/queries";
import { payrollRunSchema, payslipAdjustmentSchema } from "@/features/payroll/schemas";

/**
 * Creates the payroll for one month and a payslip for every active employee.
 * The run starts as DRAFT so HR can review and adjust it before approving.
 */
export async function createPayrollRun(_previousResult: ActionResult, formData: FormData): Promise<ActionResult> {
  const currentUser = await requirePermission("payroll:manage");

  const parsed = payrollRunSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return validationErrorResult(parsed.error);
  const { month, year } = parsed.data;

  const existingRun = await prisma.payrollRun.findUnique({ where: { month_year: { month, year } } });
  if (existingRun) return errorResult(`Payroll for ${MONTH_NAMES[month - 1]} ${year} already exists`);

  const { firstDay, lastDay } = getMonthRange(month, year);

  // Everyone who was hired before the end of the month and is still working.
  const employees = await prisma.employee.findMany({
    where: { deletedAt: null, status: { notIn: ["RESIGNED", "TERMINATED"] }, hireDate: { lte: lastDay } },
    include: { attendances: { where: { status: "ABSENT", date: { gte: firstDay, lte: lastDay } } } },
  });
  if (employees.length === 0) return errorResult("There are no active employees to pay");

  const payslipsData = [];
  for (const employee of employees) {
    const absentDays = employee.attendances.length;
    const unpaidLeaveDays = await countUnpaidLeaveDaysInMonth(employee.id, month, year);
    const { absenceDeduction, netSalary } = calculatePayslip({
      baseSalary: employee.baseSalary,
      allowances: employee.allowances,
      absentDays,
      unpaidLeaveDays,
    });

    payslipsData.push({
      employeeId: employee.id,
      baseSalary: employee.baseSalary,
      allowances: employee.allowances,
      absentDays,
      unpaidLeaveDays,
      absenceDeduction,
      netSalary,
      currency: employee.currency,
    });
  }

  const payrollRun = await prisma.payrollRun.create({
    data: { month, year, payslips: { create: payslipsData } },
  });

  await createAuditLog({ userId: currentUser.id, action: "CREATE", entity: "PayrollRun", entityId: payrollRun.id, details: { month, year, employees: employees.length } });
  revalidatePath("/payroll");
  redirect(`/payroll/${payrollRun.id}`);
}

/** HR can add a bonus or an extra deduction while the run is still a draft. */
export async function adjustPayslip(_previousResult: ActionResult, formData: FormData): Promise<ActionResult> {
  const currentUser = await requirePermission("payroll:manage");

  const parsed = payslipAdjustmentSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return validationErrorResult(parsed.error);

  const payslip = await prisma.payslip.findUnique({ where: { id: parsed.data.payslipId }, include: { payrollRun: true } });
  if (!payslip) return errorResult("Payslip not found");
  if (payslip.payrollRun.status !== "DRAFT") return errorResult("This month is locked. Only draft payrolls can be changed.");

  const bonus = new Prisma.Decimal(parsed.data.bonus);
  const otherDeductions = new Prisma.Decimal(parsed.data.otherDeductions);
  const { netSalary } = calculatePayslip({
    baseSalary: payslip.baseSalary,
    allowances: payslip.allowances,
    absentDays: payslip.absentDays,
    unpaidLeaveDays: payslip.unpaidLeaveDays,
    bonus,
    otherDeductions,
  });

  await prisma.payslip.update({ where: { id: payslip.id }, data: { bonus, otherDeductions, netSalary } });

  await createAuditLog({
    userId: currentUser.id,
    action: "UPDATE",
    entity: "Payslip",
    entityId: payslip.id,
    details: { bonus: bonus.toString(), otherDeductions: otherDeductions.toString() },
  });
  revalidatePath(`/payroll/${payslip.payrollRunId}`);
  return successResult("Payslip updated");
}

async function changePayrollRunStatus(formData: FormData, fromStatus: "DRAFT" | "APPROVED", toStatus: "APPROVED" | "PAID") {
  const currentUser = await requirePermission("payroll:manage");
  const payrollRunId = String(formData.get("payrollRunId"));

  const payrollRun = await prisma.payrollRun.findUnique({ where: { id: payrollRunId } });
  if (!payrollRun) return errorResult("Payroll not found");
  if (payrollRun.status !== fromStatus) return errorResult(`Only ${fromStatus.toLowerCase()} payrolls can be marked as ${toStatus.toLowerCase()}`);

  await prisma.payrollRun.update({ where: { id: payrollRunId }, data: { status: toStatus } });

  await createAuditLog({ userId: currentUser.id, action: toStatus, entity: "PayrollRun", entityId: payrollRunId });
  revalidatePath("/payroll");
  revalidatePath(`/payroll/${payrollRunId}`);
  return successResult(`Payroll marked as ${toStatus.toLowerCase()}`);
}

/** Approving locks the month: payslips cannot change anymore and employees can see them. */
export async function approvePayrollRun(_previousResult: ActionResult, formData: FormData): Promise<ActionResult> {
  return changePayrollRunStatus(formData, "DRAFT", "APPROVED");
}

export async function markPayrollRunPaid(_previousResult: ActionResult, formData: FormData): Promise<ActionResult> {
  return changePayrollRunStatus(formData, "APPROVED", "PAID");
}

export async function deletePayrollRun(_previousResult: ActionResult, formData: FormData): Promise<ActionResult> {
  const currentUser = await requirePermission("payroll:manage");
  const payrollRunId = String(formData.get("payrollRunId"));

  const payrollRun = await prisma.payrollRun.findUnique({ where: { id: payrollRunId } });
  if (!payrollRun) return errorResult("Payroll not found");
  if (payrollRun.status !== "DRAFT") return errorResult("Approved payrolls cannot be deleted");

  // Payslips are deleted too (onDelete: Cascade in the schema).
  await prisma.payrollRun.delete({ where: { id: payrollRunId } });

  await createAuditLog({ userId: currentUser.id, action: "DELETE", entity: "PayrollRun", entityId: payrollRunId });
  revalidatePath("/payroll");
  redirect("/payroll");
}
