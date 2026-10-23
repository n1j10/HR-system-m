import { prisma } from "@/lib/prisma";
import { getToday } from "@/lib/dates";

const activeEmployeeFilter = { deletedAt: null, status: { notIn: ["RESIGNED" as const, "TERMINATED" as const] } };

/** Headline numbers for HR and admins. */
export async function getCompanyStats() {
  const today = getToday();
  const firstDayOfMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));

  const [totalEmployees, presentToday, onLeaveToday, newHiresThisMonth] = await Promise.all([
    prisma.employee.count({ where: activeEmployeeFilter }),
    prisma.attendance.count({ where: { date: today, status: { in: ["PRESENT", "LATE", "REMOTE"] } } }),
    prisma.leaveRequest.count({ where: { status: "APPROVED", startDate: { lte: today }, endDate: { gte: today } } }),
    prisma.employee.count({ where: { ...activeEmployeeFilter, hireDate: { gte: firstDayOfMonth } } }),
  ]);

  return { totalEmployees, presentToday, onLeaveToday, newHiresThisMonth };
}

/** Number of active employees in each department, biggest first. */
export async function getHeadcountByDepartment() {
  const departments = await prisma.department.findMany({
    select: { id: true, name: true, _count: { select: { employees: { where: activeEmployeeFilter } } } },
  });

  return departments
    .map((department) => ({ id: department.id, name: department.name, employeeCount: department._count.employees }))
    .sort((first, second) => second.employeeCount - first.employeeCount);
}

/** Employees whose probation ends in the next 30 days. */
export async function getProbationsEndingSoon() {
  const today = getToday();
  const in30Days = new Date(today);
  in30Days.setUTCDate(in30Days.getUTCDate() + 30);

  return prisma.employee.findMany({
    where: { deletedAt: null, status: "PROBATION", probationEndDate: { gte: today, lte: in30Days } },
    orderBy: { probationEndDate: "asc" },
    select: { id: true, firstName: true, lastName: true, probationEndDate: true },
  });
}
