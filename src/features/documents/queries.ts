import { prisma } from "@/lib/prisma";
import { addDays, getToday } from "@/lib/dates";

/** Documents that expire within this many days are highlighted. */
export const EXPIRY_WARNING_DAYS = 30;

export async function getAllDocuments() {
  return prisma.document.findMany({
    where: { employee: { deletedAt: null } },
    orderBy: [{ expiresAt: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
    include: { employee: { select: { id: true, firstName: true, lastName: true } } },
  });
}

export async function countDocumentsExpiringSoon() {
  return prisma.document.count({
    where: {
      employee: { deletedAt: null },
      expiresAt: { lte: addDays(getToday(), EXPIRY_WARNING_DAYS) },
    },
  });
}
