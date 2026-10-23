import { describe, expect, it } from "vitest";

import { countWorkingDays } from "@/features/leaves/leave-days";

// Weekend is Friday + Saturday (see WEEKEND_DAYS in src/lib/dates.ts).
// 2026-10-18 is a Sunday.
const date = (text: string) => new Date(text);

describe("countWorkingDays", () => {
  it("counts a normal Sunday-to-Thursday week as 5 days", () => {
    expect(countWorkingDays(date("2026-10-18"), date("2026-10-22"), [])).toBe(5);
  });

  it("does not count Friday and Saturday", () => {
    // Sunday to next Sunday = 8 calendar days, 6 working days
    expect(countWorkingDays(date("2026-10-18"), date("2026-10-25"), [])).toBe(6);
  });

  it("does not count official holidays", () => {
    const holidays = [date("2026-10-20")];
    expect(countWorkingDays(date("2026-10-18"), date("2026-10-22"), holidays)).toBe(4);
  });

  it("returns 0 when the leave is only on the weekend", () => {
    expect(countWorkingDays(date("2026-10-23"), date("2026-10-24"), [])).toBe(0);
  });

  it("counts a single working day", () => {
    expect(countWorkingDays(date("2026-10-21"), date("2026-10-21"), [])).toBe(1);
  });
});
