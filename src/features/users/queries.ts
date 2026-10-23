import { prisma } from "@/lib/prisma";

export async function getAllUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    include: { employee: { select: { id: true, firstName: true, lastName: true, employeeNumber: true } } },
  });
}

/** Employees that are not linked to any login yet. */
export async function getEmployeesWithoutAccount() {
  return prisma.employee.findMany({
    where: { deletedAt: null, userId: null },
    orderBy: { firstName: "asc" },
    select: { id: true, firstName: true, lastName: true, employeeNumber: true },
  });
}
