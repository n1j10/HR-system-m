import { AttendanceStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getMonthRange } from "@/lib/dates";

export async function getAttendanceOfDay(employeeId: string, date: Date) {
  return prisma.attendance.findUnique({ where: { employeeId_date: { employeeId, date } } });
}

export async function getRecentAttendance(employeeId: string, numberOfRecords = 30) {
  return prisma.attendance.findMany({ where: { employeeId }, orderBy: { date: "desc" }, take: numberOfRecords });
}

/** All active employees with their attendance record for one date (or null when missing). */
export async function getDailyAttendanceSheet(date: Date) {
  const employees = await prisma.employee.findMany({
    where: { deletedAt: null, status: { notIn: ["RESIGNED", "TERMINATED"] } },
    orderBy: { firstName: "asc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      employeeNumber: true,
      attendances: { where: { date } },
    },
  });

  return employees.map((employee) => ({ ...employee, attendance: employee.attendances[0] ?? null }));
}

/** How many days each employee was present, late, absent, ... in one month. */
export async function getMonthlyAttendanceReport(month: number, year: number) {
  const { firstDay, lastDay } = getMonthRange(month, year);

  const employees = await prisma.employee.findMany({
    where: { deletedAt: null },
    orderBy: { firstName: "asc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      employeeNumber: true,
      department: { select: { name: true } },
      attendances: { where: { date: { gte: firstDay, lte: lastDay } } },
    },
  });

  return employees.map((employee) => {
    const countByStatus = (status: AttendanceStatus) =>
      employee.attendances.filter((attendance) => attendance.status === status).length;

    return {
      ...employee,
      presentDays: countByStatus("PRESENT") + countByStatus("REMOTE"),
      lateDays: countByStatus("LATE"),
      absentDays: countByStatus("ABSENT"),
      leaveDays: countByStatus("LEAVE"),
      totalLateMinutes: employee.attendances.reduce((total, attendance) => total + attendance.lateMinutes, 0),
      totalOvertimeMinutes: employee.attendances.reduce((total, attendance) => total + attendance.overtimeMinutes, 0),
    };
  });
}
