import { describe, expect, it } from "vitest";

import { calculateLateMinutes, calculateOvertimeMinutes } from "@/features/attendance/attendance-rules";

// Work starts 08:00 with a 15-minute grace period and ends 16:00 (see src/lib/dates.ts).
const timeToday = (hours: number, minutes: number) => {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

describe("calculateLateMinutes", () => {
  it("is 0 when checking in early", () => {
    expect(calculateLateMinutes(timeToday(7, 45))).toBe(0);
  });

  it("is 0 inside the grace period", () => {
    expect(calculateLateMinutes(timeToday(8, 15))).toBe(0);
  });

  it("counts all minutes after 08:00 once the grace period is over", () => {
    expect(calculateLateMinutes(timeToday(8, 40))).toBe(40);
  });
});

describe("calculateOvertimeMinutes", () => {
  it("is 0 when leaving before the end of the day", () => {
    expect(calculateOvertimeMinutes(timeToday(15, 30))).toBe(0);
  });

  it("counts minutes after 16:00", () => {
    expect(calculateOvertimeMinutes(timeToday(17, 30))).toBe(90);
  });
});
