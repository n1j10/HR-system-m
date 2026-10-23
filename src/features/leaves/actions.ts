"use server";

import { revalidatePath } from "next/cache";

import { requireEmployeeProfile, requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { getToday } from "@/lib/dates";
import { formDataToObject } from "@/lib/validation";
import { errorResult, successResult, validationErrorResult, type ActionResult } from "@/lib/action-result";
import { getHolidaysBetween } from "@/features/holidays/queries";
import { countWorkingDays, getWorkingDates } from "@/features/leaves/leave-days";
import { canDecideLeaveRequest, getOrCreateLeaveBalance, getPendingLeaveDays } from "@/features/leaves/queries";
import { leaveDecisionSchema, leaveRequestSchema, leaveTypeSchema } from "@/features/leaves/schemas";

function revalidateLeavePages() {
  revalidatePath("/leaves");
  revalidatePath("/leaves/approvals");
  revalidatePath("/dashboard");
}

// ───────────────────────────── Employee ─────────────────────────────

export async function requestLeave(_previousResult: ActionResult, formData: FormData): Promise<ActionResult> {
  const { user, employee } = await requireEmployeeProfile();

  const parsed = leaveRequestSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return validationErrorResult(parsed.error);
  const { leaveTypeId, startDate, endDate, reason, attachmentUrl } = parsed.data;

  // 1. Check the dates
  if (endDate < startDate) return errorResult("End date must be on or after the start date");
  if (startDate.getUTCFullYear() !== endDate.getUTCFullYear()) {
    return errorResult("A leave cannot cross into a new year. Please split it into two requests.");
  }

  const leaveType = await prisma.leaveType.findUnique({ where: { id: leaveTypeId } });
  if (!leaveType) return errorResult("Leave type not found");
  if (leaveType.requiresAttachment && !attachmentUrl) {
    return errorResult(`${leaveType.name} needs an attachment (for example a medical report)`);
  }

  // 2. Count the working days (weekends and holidays are free)
  const holidays = await getHolidaysBetween(startDate, endDate);
  const requestedDays = countWorkingDays(startDate, endDate, holidays.map((holiday) => holiday.date));
  if (requestedDays === 0) return errorResult("The selected days are all weekends or holidays");

  // 3. Make sure it does not overlap another request
  const overlappingRequest = await prisma.leaveRequest.findFirst({
    where: {
      employeeId: employee.id,
      status: { in: ["PENDING", "APPROVED"] },
      startDate: { lte: endDate },
      endDate: { gte: startDate },
    },
  });
  if (overlappingRequest) return errorResult("You already have a leave request in these dates");

  // 4. Check the balance (pending requests count too, so you cannot over-book)
  const year = startDate.getUTCFullYear();
  const balance = await getOrCreateLeaveBalance(employee.id, leaveType, year);
  const pendingDays = await getPendingLeaveDays(employee.id, leaveType.id, year);
  const remainingDays = balance.totalDays - balance.usedDays - pendingDays;
  if (requestedDays > remainingDays) {
    return errorResult(`Not enough balance. You asked for ${requestedDays} day(s) but have ${remainingDays} left.`);
  }

  const leaveRequest = await prisma.leaveRequest.create({
    data: { employeeId: employee.id, leaveTypeId, startDate, endDate, days: requestedDays, reason, attachmentUrl },
  });

  await createAuditLog({ userId: user.id, action: "CREATE", entity: "LeaveRequest", entityId: leaveRequest.id, details: { days: requestedDays } });
  revalidateLeavePages();
  return successResult(`Leave request sent for ${requestedDays} working day(s)`);
}

export async function cancelLeaveRequest(_previousResult: ActionResult, formData: FormData): Promise<ActionResult> {
  const { user, employee } = await requireEmployeeProfile();
  const leaveRequestId = String(formData.get("leaveRequestId"));

  const leaveRequest = await prisma.leaveRequest.findUnique({ where: { id: leaveRequestId } });
  if (!leaveRequest || leaveRequest.employeeId !== employee.id) return errorResult("Leave request not found");
  if (leaveRequest.status !== "PENDING") return errorResult("Only pending requests can be cancelled");

  await prisma.leaveRequest.update({ where: { id: leaveRequestId }, data: { status: "CANCELLED" } });

  await createAuditLog({ userId: user.id, action: "CANCEL", entity: "LeaveRequest", entityId: leaveRequestId });
  revalidateLeavePages();
  return successResult("Leave request cancelled");
}

// ───────────────────────────── Approver ─────────────────────────────

async function findPendingRequestForDecision(leaveRequestId: string) {
  const currentUser = await requirePermission("leave:approve");

  const leaveRequest = await prisma.leaveRequest.findUnique({
    where: { id: leaveRequestId },
    include: { employee: { select: { managerId: true } }, leaveType: true },
  });

  if (!leaveRequest) return { currentUser, error: "Leave request not found" } as const;
  if (leaveRequest.status !== "PENDING") return { currentUser, error: "This request was already decided" } as const;
  if (!canDecideLeaveRequest(currentUser, leaveRequest)) {
    return { currentUser, error: "You can only decide requests from your own team" } as const;
  }
  return { currentUser, leaveRequest } as const;
}

export async function approveLeaveRequest(_previousResult: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = leaveDecisionSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return validationErrorResult(parsed.error);

  const { currentUser, leaveRequest, error } = await findPendingRequestForDecision(parsed.data.leaveRequestId);
  if (error) return errorResult(error);

  const year = leaveRequest.startDate.getUTCFullYear();
  const balance = await getOrCreateLeaveBalance(leaveRequest.employeeId, leaveRequest.leaveType, year);
  if (balance.usedDays + leaveRequest.days > balance.totalDays) {
    return errorResult("The employee does not have enough balance anymore");
  }

  const holidays = await getHolidaysBetween(leaveRequest.startDate, leaveRequest.endDate);
  const leaveDates = getWorkingDates(leaveRequest.startDate, leaveRequest.endDate, holidays.map((holiday) => holiday.date));

  // Everything below happens together: if one step fails, nothing is saved.
  await prisma.$transaction([
    prisma.leaveRequest.update({
      where: { id: leaveRequest.id },
      data: { status: "APPROVED", decidedById: currentUser.id, decidedAt: new Date(), decisionNote: parsed.data.decisionNote },
    }),
    prisma.leaveBalance.update({
      where: { id: balance.id },
      data: { usedDays: { increment: leaveRequest.days } },
    }),
    // Mark each leave day in attendance, so it is not counted as absent.
    ...leaveDates.map((date) =>
      prisma.attendance.upsert({
        where: { employeeId_date: { employeeId: leaveRequest.employeeId, date } },
        create: { employeeId: leaveRequest.employeeId, date, status: "LEAVE", note: leaveRequest.leaveType.name },
        update: { status: "LEAVE", note: leaveRequest.leaveType.name },
      })
    ),
  ]);

  await createAuditLog({ userId: currentUser.id, action: "APPROVE", entity: "LeaveRequest", entityId: leaveRequest.id });
  revalidateLeavePages();
  return successResult("Leave approved");
}

export async function rejectLeaveRequest(_previousResult: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = leaveDecisionSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return validationErrorResult(parsed.error);

  const { currentUser, leaveRequest, error } = await findPendingRequestForDecision(parsed.data.leaveRequestId);
  if (error) return errorResult(error);

  await prisma.leaveRequest.update({
    where: { id: leaveRequest.id },
    data: { status: "REJECTED", decidedById: currentUser.id, decidedAt: new Date(), decisionNote: parsed.data.decisionNote },
  });

  await createAuditLog({ userId: currentUser.id, action: "REJECT", entity: "LeaveRequest", entityId: leaveRequest.id });
  revalidateLeavePages();
  return successResult("Leave rejected");
}

// ─────────────────────────── Leave types (HR) ───────────────────────────

export async function createLeaveType(_previousResult: ActionResult, formData: FormData): Promise<ActionResult> {
  const currentUser = await requirePermission("leave:manage");

  const parsed = leaveTypeSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return validationErrorResult(parsed.error);

  const nameIsTaken = await prisma.leaveType.findUnique({ where: { name: parsed.data.name } });
  if (nameIsTaken) return errorResult("A leave type with this name already exists");

  const leaveType = await prisma.leaveType.create({ data: parsed.data });

  await createAuditLog({ userId: currentUser.id, action: "CREATE", entity: "LeaveType", entityId: leaveType.id, details: parsed.data });
  revalidatePath("/leaves/types");
  return successResult("Leave type created");
}

export async function updateLeaveTypeDays(_previousResult: ActionResult, formData: FormData): Promise<ActionResult> {
  const currentUser = await requirePermission("leave:manage");
  const leaveTypeId = String(formData.get("leaveTypeId"));
  const daysPerYear = Number(formData.get("daysPerYear"));

  if (!Number.isInteger(daysPerYear) || daysPerYear < 0 || daysPerYear > 365) {
    return errorResult("Days per year must be a whole number between 0 and 365");
  }

  await prisma.leaveType.update({ where: { id: leaveTypeId }, data: { daysPerYear } });

  // Also update this year's balances so the change applies right away.
  const currentYear = getToday().getUTCFullYear();
  await prisma.leaveBalance.updateMany({ where: { leaveTypeId, year: currentYear }, data: { totalDays: daysPerYear } });

  await createAuditLog({ userId: currentUser.id, action: "UPDATE", entity: "LeaveType", entityId: leaveTypeId, details: { daysPerYear } });
  revalidatePath("/leaves/types");
  return successResult("Yearly days updated");
}

export async function deleteLeaveType(_previousResult: ActionResult, formData: FormData): Promise<ActionResult> {
  const currentUser = await requirePermission("leave:manage");
  const leaveTypeId = String(formData.get("leaveTypeId"));

  const requestCount = await prisma.leaveRequest.count({ where: { leaveTypeId } });
  if (requestCount > 0) return errorResult("This leave type is used by existing requests and cannot be deleted");

  await prisma.$transaction([
    prisma.leaveBalance.deleteMany({ where: { leaveTypeId } }),
    prisma.leaveType.delete({ where: { id: leaveTypeId } }),
  ]);

  await createAuditLog({ userId: currentUser.id, action: "DELETE", entity: "LeaveType", entityId: leaveTypeId });
  revalidatePath("/leaves/types");
  return successResult("Leave type deleted");
}

