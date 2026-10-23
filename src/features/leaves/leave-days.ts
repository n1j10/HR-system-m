import { getDatesBetween, isSameDay, isWeekend } from "@/lib/dates";

/** Returns only the dates that are work days (not weekend and not an official holiday). */
export function getWorkingDates(startDate: Date, endDate: Date, holidayDates: Date[]): Date[] {
  return getDatesBetween(startDate, endDate).filter((date) => {
    const isHoliday = holidayDates.some((holidayDate) => isSameDay(holidayDate, date));
    return !isWeekend(date) && !isHoliday;
  });
}

/** How many leave days a request costs. Weekends and holidays are free. */
export function countWorkingDays(startDate: Date, endDate: Date, holidayDates: Date[]): number {
  return getWorkingDates(startDate, endDate, holidayDates).length;
}
