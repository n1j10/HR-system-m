import type { EmployeeStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { canSeeAllEmployees } from "@/lib/permissions";
import type { CurrentUser } from "@/lib/auth";

export const EMPLOYEES_PER_PAGE = 15;

/**
 * Which employees can this user see?
 * HR sees everyone. A manager only sees the people who report to them.
 * Archived (soft-deleted) employees are always hidden.
 */
export function getVisibleEmployeesFilter(user: CurrentUser): Prisma.EmployeeWhereInput {
  if (canSeeAllEmployees(user.role)) return { deletedAt: null };
  if (!user.employee) return { id: { in: [] } };
  return { deletedAt: null, managerId: user.employee.id };
}

export function canViewEmployee(user: CurrentUser, employee: { id: string; managerId: string | null }): boolean {
  if (canSeeAllEmployees(user.role)) return true;
  return Boolean(user.employee) && employee.managerId === user.employee?.id;
}

type EmployeeListFilters = {
  search?: string;
  departmentId?: string;
  status?: EmployeeStatus;
  page: number;
};

export async function getEmployeeList(user: CurrentUser, filters: EmployeeListFilters) {
  // An empty object {} means "no condition", so unused filters do nothing.
  const searchFilter: Prisma.EmployeeWhereInput = filters.search
    ? {
        OR: [
          { firstName: { contains: filters.search, mode: "insensitive" } },
          { lastName: { contains: filters.search, mode: "insensitive" } },
          { email: { contains: filters.search, mode: "insensitive" } },
          { employeeNumber: { contains: filters.search, mode: "insensitive" } },
        ],
      }
    : {};

  const where: Prisma.EmployeeWhereInput = {
    AND: [
      getVisibleEmployeesFilter(user),
      searchFilter,
      filters.departmentId ? { departmentId: filters.departmentId } : {},
      filters.status ? { status: filters.status } : {},
    ],
  };

  const [employees, totalEmployees] = await Promise.all([
    prisma.employee.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (filters.page - 1) * EMPLOYEES_PER_PAGE,
      take: EMPLOYEES_PER_PAGE,
      // Salary fields are not selected here on purpose.
      select: {
        id: true,
        employeeNumber: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
        hireDate: true,
        department: { select: { name: true } },
        position: { select: { title: true } },
      },
    }),
    prisma.employee.count({ where }),
  ]);

  return { employees, totalPages: Math.ceil(totalEmployees / EMPLOYEES_PER_PAGE) };
}

/** Small list of active employees for dropdowns (manager, asset owner, ...). */
export async function getEmployeeOptions() {
  return prisma.employee.findMany({
    where: { deletedAt: null, status: { notIn: ["RESIGNED", "TERMINATED"] } },
    orderBy: { firstName: "asc" },
    select: { id: true, firstName: true, lastName: true, employeeNumber: true },
  });
}

export async function getEmployeeForEdit(employeeId: string) {
  return prisma.employee.findFirst({ where: { id: employeeId, deletedAt: null } });
}

/** Everything shown on the employee profile page. */
export async function getEmployeeProfile(employeeId: string) {
  return prisma.employee.findFirst({
    where: { id: employeeId, deletedAt: null },
    include: {
      department: true,
      position: true,
      manager: { select: { id: true, firstName: true, lastName: true } },
      attendances: { orderBy: { date: "desc" }, take: 30 },
      leaveRequests: { orderBy: { createdAt: "desc" }, take: 20, include: { leaveType: true } },
      documents: { orderBy: { createdAt: "desc" } },
      assets: { orderBy: { assignedAt: "desc" } },
    },
  });
}

export type EmployeeProfile = NonNullable<Awaited<ReturnType<typeof getEmployeeProfile>>>;
