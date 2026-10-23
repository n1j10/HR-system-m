// Dates without time (birth date, leave days, attendance day) are stored as
// midnight UTC. These helpers keep that rule in one place so we never end up
// one day off because of the server's time zone.

/** Weekend days. 0 = Sunday ... 5 = Friday, 6 = Saturday. */
export const WEEKEND_DAYS = [5, 6];

/** Work starts at 08:00. Employees checking in after 08:15 are late. */
export const WORK_START_HOUR = 8;
export const LATE_GRACE_MINUTES = 15;
/** Work ends at 16:00. Time after that counts as overtime. */
export const WORK_END_HOUR = 16;

export function toDateOnly(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

export function getToday(): Date {
  return toDateOnly(new Date());
}

export function addDays(date: Date, numberOfDays: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + numberOfDays);
  return result;
}

export function isWeekend(date: Date): boolean {
  return WEEKEND_DAYS.includes(date.getUTCDay());
}

export function isSameDay(firstDate: Date, secondDate: Date): boolean {
  return firstDate.toISOString().slice(0, 10) === secondDate.toISOString().slice(0, 10);
}

/** Returns every date from start to end (both included). */
export function getDatesBetween(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  for (let date = startDate; date <= endDate; date = addDays(date, 1)) {
    dates.push(date);
  }
  return dates;
}

/** First and last day of a month. `month` is 1-12. */
export function getMonthRange(month: number, year: number) {
  const firstDay = new Date(Date.UTC(year, month - 1, 1));
  const lastDay = new Date(Date.UTC(year, month, 0));
  return { firstDay, lastDay };
}

/** "2026-10-21" — the value format of <input type="date" />. */
export function toDateInputValue(date: Date | null | undefined): string {
  return date ? date.toISOString().slice(0, 10) : "";
}
