import { prisma } from "@/lib/prisma";

export async function getAllAssets() {
  return prisma.asset.findMany({
    orderBy: { createdAt: "desc" },
    include: { assignedEmployee: { select: { id: true, firstName: true, lastName: true } } },
  });
}
