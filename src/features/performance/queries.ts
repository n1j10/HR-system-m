import { prisma } from "@/lib/prisma";
import type { CurrentUser } from "@/lib/auth";
import { getVisibleEmployeesFilter } from "@/features/employees/queries";

const employeeNameSelect = { select: { id: true, firstName: true, lastName: true } } as const;

export async function getMyGoals(employeeId: string) {
  return prisma.goal.findMany({ where: { employeeId }, orderBy: { createdAt: "desc" } });
}

export async function getMyReviews(employeeId: string) {
  return prisma.performanceReview.findMany({
    where: { employeeId },
    orderBy: { createdAt: "desc" },
    include: { reviewer: { select: { name: true, email: true } } },
  });
}

/** Goals of everyone the manager / HR can see (not including their own). */
export async function getTeamGoals(user: CurrentUser) {
  return prisma.goal.findMany({
    where: { employee: getVisibleEmployeesFilter(user), employeeId: { not: user.employee?.id } },
    orderBy: { createdAt: "desc" },
    include: { employee: employeeNameSelect },
  });
}

export async function getTeamReviews(user: CurrentUser) {
  return prisma.performanceReview.findMany({
    where: { employee: getVisibleEmployeesFilter(user), employeeId: { not: user.employee?.id } },
    orderBy: { createdAt: "desc" },
    include: { employee: employeeNameSelect },
  });
}
