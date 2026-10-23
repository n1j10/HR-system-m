"use server";

import { revalidatePath } from "next/cache";

import { requireEmployeeProfile, requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { getToday, isWeekend } from "@/lib/dates";
import { formDataToObject, requiredDate } from "@/lib/validation";
import { errorResult, successResult, validationErrorResult, type ActionResult } from "@/lib/action-result";
import { isHoliday } from "@/features/holidays/queries";
import { getAttendanceOfDay } from "@/features/attendance/queries";
import { manualAttendanceSchema } from "@/features/attendance/schemas";
import { calculateLateMinutes, calculateOvertimeMinutes } from "@/features/attendance/attendance-rules";

export async function checkIn(): Promise<ActionResult> {
  const { employee } = await requireEmployeeProfile();
  const today = getToday();

  const todayAttendance = await getAttendanceOfDay(employee.id, today);
  if (todayAttendance?.checkInAt) return errorResult("You already checked in today");

  const now = new Date();
  const lateMinutes = calculateLateMinutes(now);

  await prisma.attendance.upsert({
    where: { employeeId_date: { employeeId: employee.id, date: today } },
    create: { employeeId: employee.id, date: today, checkInAt: now, lateMinutes, status: lateMinutes > 0 ? "LATE" : "PRESENT" },
    update: { checkInAt: now, lateMinutes, status: lateMinutes > 0 ? "LATE" : "PRESENT" },
  });

  revalidatePath("/attendance");
  return successResult(lateMinutes > 0 ? `Checked in (${lateMinutes} minutes late)` : "Checked in. Have a good day!");
}

export async function checkOut(): Promise<ActionResult> {
  const { employee } = await requireEmployeeProfile();
  const today = getToday();

  const todayAttendance = await getAttendanceOfDay(employee.id, today);
  if (!todayAttendance?.checkInAt) return errorResult("You need to check in first");
  if (todayAttendance.checkOutAt) return errorResult("You already checked out today");

  const now = new Date();
  await prisma.attendance.update({
    where: { id: todayAttendance.id },
    data: { checkOutAt: now, overtimeMinutes: calculateOvertimeMinutes(now) },
  });

  revalidatePath("/attendance");
  return successResult("Checked out. See you tomorrow!");
}

/** Builds a full date-time from "2026-10-21" and "08:05". */
function combineDateAndTime(date: Date, time: string | null): Date | null {
  if (!time) return null;
  const dateText = date.toISOString().slice(0, 10);
  return new Date(`${dateText}T${time}`);
}

export async function saveManualAttendance(_previousResult: ActionResult, formData: FormData): Promise<ActionResult> {
  const currentUser = await requirePermission("attendance:manage");

  const parsed = manualAttendanceSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return validationErrorResult(parsed.error);

  const { employeeId, date, status, note } = parsed.data;
  const checkInAt = combineDateAndTime(date, parsed.data.checkInTime);
  const checkOutAt = combineDateAndTime(date, parsed.data.checkOutTime);

  if (checkInAt && checkOutAt && checkOutAt <= checkInAt) {
    return errorResult("Check out must be after check in");
  }

  const attendanceData = {
    status,
    note,
    checkInAt,
    checkOutAt,
    lateMinutes: checkInAt && status === "LATE" ? calculateLateMinutes(checkInAt) : 0,
    overtimeMinutes: checkOutAt ? calculateOvertimeMinutes(checkOutAt) : 0,
  };

  const attendance = await prisma.attendance.upsert({
    where: { employeeId_date: { employeeId, date } },
    create: { employeeId, date, ...attendanceData },
    update: attendanceData,
  });

  await createAuditLog({
    userId: currentUser.id,
    action: "MANUAL_ATTENDANCE",
    entity: "Attendance",
    entityId: attendance.id,
    details: { employeeId, date: date.toISOString(), status, note },
  });

  revalidatePath("/attendance/manage");
  return successResult("Attendance saved");
}

/** Marks everyone without a record on this date as ABSENT. Skips weekends and holidays. */
export async function markMissingAsAbsent(_previousResult: ActionResult, formData: FormData): Promise<ActionResult> {
  const currentUser = await requirePermission("attendance:manage");

  const parsedDate = requiredDate.safeParse(formData.get("date"));
  if (!parsedDate.success) return validationErrorResult(parsedDate.error);
  const date = parsedDate.data;

  if (date > getToday()) return errorResult("You cannot mark future days as absent");
  if (isWeekend(date)) return errorResult("This date is a weekend");
  if (await isHoliday(date)) return errorResult("This date is an official holiday");

  const employeesWithoutRecord = await prisma.employee.findMany({
    where: {
      deletedAt: null,
      status: { notIn: ["RESIGNED", "TERMINATED"] },
      hireDate: { lte: date },
      attendances: { none: { date } },
    },
    select: { id: true },
  });

  await prisma.attendance.createMany({
    data: employeesWithoutRecord.map((employee) => ({ employeeId: employee.id, date, status: "ABSENT" as const })),
  });

  await createAuditLog({
    userId: currentUser.id,
    action: "MARK_ABSENT",
    entity: "Attendance",
    details: { date: date.toISOString(), numberOfEmployees: employeesWithoutRecord.length },
  });

  revalidatePath("/attendance/manage");
  return successResult(`${employeesWithoutRecord.length} employee(s) marked as absent`);
}
