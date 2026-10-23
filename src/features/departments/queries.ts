import { prisma } from "@/lib/prisma";

export async function getDepartmentsWithEmployeeCount() {
  return prisma.department.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { employees: { where: { deletedAt: null } } } } },
  });
}

export async function getDepartmentOptions() {
  return prisma.department.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
}

export async function getDepartmentById(departmentId: string) {
  return prisma.department.findUnique({ where: { id: departmentId } });
}
