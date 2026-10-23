import { z } from "zod";

import { AttendanceStatus } from "@prisma/client";
import { optionalText, requiredDate, requiredText } from "@/lib/validation";

/** HR fills this to add or fix an attendance record by hand. */
export const manualAttendanceSchema = z.object({
  employeeId: requiredText,
  date: requiredDate,
  status: z.enum(AttendanceStatus),
  checkInTime: optionalText, // "08:05"
  checkOutTime: optionalText, // "16:30"
  note: requiredText, // Why HR added or changed this record by hand
});
