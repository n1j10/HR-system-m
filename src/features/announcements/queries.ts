import { prisma } from "@/lib/prisma";

export async function getLatestAnnouncements(numberOfAnnouncements = 20) {
  return prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    take: numberOfAnnouncements,
    include: { createdBy: { select: { name: true, email: true } } },
  });
}
