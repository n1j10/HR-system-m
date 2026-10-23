import { prisma } from "@/lib/prisma";

export async function getPositionsWithEmployeeCount() {
  return prisma.position.findMany({
    orderBy: [{ level: "desc" }, { title: "asc" }],
    include: { _count: { select: { employees: { where: { deletedAt: null } } } } },
  });
}

export async function getPositionOptions() {
  return prisma.position.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } });
}

export async function getPositionById(positionId: string) {
  return prisma.position.findUnique({ where: { id: positionId } });
}
