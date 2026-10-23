import { prisma } from "@/lib/prisma";

export async function getHolidaysOfYear(year: number) {
  return prisma.holiday.findMany({
    where: { date: { gte: new Date(Date.UTC(year, 0, 1)), lte: new Date(Date.UTC(year, 11, 31)) } },
    orderBy: { date: "asc" },
  });
}

export async function getHolidaysBetween(startDate: Date, endDate: Date) {
  return prisma.holiday.findMany({ where: { date: { gte: startDate, lte: endDate } } });
}

export async function isHoliday(date: Date): Promise<boolean> {
  const holiday = await prisma.holiday.findUnique({ where: { date } });
  return Boolean(holiday);
}
