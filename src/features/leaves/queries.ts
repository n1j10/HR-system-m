import type { LeaveType, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { canSeeAllEmployees } from "@/lib/permissions";
import { getToday, addDays } from "@/lib/dates";
import type { CurrentUser } from "@/lib/auth";

export async function getLeaveTypes() {
  return prisma.leaveType.findMany({ orderBy: { name: "asc" } });
}

/**
 * Balances are created the first time they are needed, using the yearly
 * allowance of the leave type. This way a new year "renews" automatically.
 */
export async function getOrCreateLeaveBalance(employeeId: string, leaveType: LeaveType, year: number) {
  return prisma.leaveBalance.upsert({
    where: { employeeId_leaveTypeId_year: { employeeId, leaveTypeId: leaveType.id, year } },
    create: { employeeId, leaveTypeId: leaveType.id, year, totalDays: leaveType.daysPerYear },
    update: {},
  });
}

/** Days already requested but still waiting for a decision. */
export async function getPendingLeaveDays(employeeId: string, leaveTypeId: string, year: number) {
  const result = await prisma.leaveRequest.aggregate({
    where: {
      employeeId,
      leaveTypeId,
      status: "PENDING",
      startDate: { gte: new Date(Date.UTC(year, 0, 1)), lte: new Date(Date.UTC(year, 11, 31)) },
    },
    _sum: { days: true },
  });
  return result._sum.days ?? 0;
}

/** One summary per leave type: total, used, pending and remaining days. */
export async function getLeaveBalanceSummary(employeeId: string, year: number) {
  const leaveTypes = await getLeaveTypes();

  return Promise.all(
    leaveTypes.map(async (leaveType) => {
      const balance = await getOrCreateLeaveBalance(employeeId, leaveType, year);
      const pendingDays = await getPendingLeaveDays(employeeId, leaveType.id, year);
      return {
        leaveType,
        totalDays: balance.totalDays,
        usedDays: balance.usedDays,
        pendingDays,
        remainingDays: balance.totalDays - balance.usedDays - pendingDays,
      };
    })
  );
}

export async function getMyLeaveRequests(employeeId: string) {
  return prisma.leaveRequest.findMany({
    where: { employeeId },
    orderBy: { createdAt: "desc" },
    include: { leaveType: true },
  });
}

/** Managers only decide for their own team. HR decides for everyone. */
function getApprovableRequestsFilter(user: CurrentUser): Prisma.LeaveRequestWhereInput {
  const isNotMyOwnRequest: Prisma.LeaveRequestWhereInput = user.employee ? { employeeId: { not: user.employee.id } } : {};

  if (canSeeAllEmployees(user.role)) return isNotMyOwnRequest;
  if (!user.employee) return { id: { in: [] } };
  return { ...isNotMyOwnRequest, employee: { managerId: user.employee.id } };
}

export function canDecideLeaveRequest(user: CurrentUser, leaveRequest: { employeeId: string; employee: { managerId: string | null } }) {
  if (leaveRequest.employeeId === user.employee?.id) return false;
  if (canSeeAllEmployees(user.role)) return true;
  return Boolean(user.employee) && leaveRequest.employee.managerId === user.employee?.id;
}

const employeeSummarySelect = { select: { firstName: true, lastName: true, employeeNumber: true } } as const;

export async function getPendingLeaveRequestsToApprove(user: CurrentUser) {
  return prisma.leaveRequest.findMany({
    where: { ...getApprovableRequestsFilter(user), status: "PENDING" },
    orderBy: { startDate: "asc" },
    include: { leaveType: true, employee: employeeSummarySelect },
  });
}

/** Approved leaves in the next 30 days: a simple "who is off" calendar. */
export async function getUpcomingTeamLeaves(user: CurrentUser) {
  const today = getToday();
  return prisma.leaveRequest.findMany({
    where: {
      ...getApprovableRequestsFilter(user),
      status: "APPROVED",
      endDate: { gte: today },
      startDate: { lte: addDays(today, 30) },
    },
    orderBy: { startDate: "asc" },
    include: { leaveType: true, employee: employeeSummarySelect },
  });
}

export async function countPendingLeaveRequestsToApprove(user: CurrentUser) {
  return prisma.leaveRequest.count({ where: { ...getApprovableRequestsFilter(user), status: "PENDING" } });
}
