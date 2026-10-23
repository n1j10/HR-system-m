import { LATE_GRACE_MINUTES, WORK_END_HOUR, WORK_START_HOUR } from "@/lib/dates";

const MILLISECONDS_PER_MINUTE = 60 * 1000;

function getMinutesBetween(earlierTime: Date, laterTime: Date): number {
  return Math.floor((laterTime.getTime() - earlierTime.getTime()) / MILLISECONDS_PER_MINUTE);
}

/**
 * Minutes the employee was late. Checking in inside the grace period counts as on time.
 * Example: work starts 08:00, grace is 15 min. 08:10 -> 0, 08:40 -> 40.
 */
export function calculateLateMinutes(checkInAt: Date): number {
  const workStartTime = new Date(checkInAt);
  workStartTime.setHours(WORK_START_HOUR, 0, 0, 0);

  const minutesAfterStart = getMinutesBetween(workStartTime, checkInAt);
  return minutesAfterStart > LATE_GRACE_MINUTES ? minutesAfterStart : 0;
}

/** Minutes worked after the end of the work day. */
export function calculateOvertimeMinutes(checkOutAt: Date): number {
  const workEndTime = new Date(checkOutAt);
  workEndTime.setHours(WORK_END_HOUR, 0, 0, 0);

  return Math.max(0, getMinutesBetween(workEndTime, checkOutAt));
}
