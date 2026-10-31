import { z } from "zod";

import { httpUrl, optionalText, requiredDate, requiredText } from "@/lib/validation";

export const leaveRequestSchema = z.object({
  leaveTypeId: requiredText,
  startDate: requiredDate,
  endDate: requiredDate,
  reason: optionalText,
  attachmentUrl: z.union([httpUrl("Attachment must be an http(s) link"), z.literal("").transform(() => null)]).optional(),
});

export const leaveTypeSchema = z.object({
  name: requiredText,
  daysPerYear: z.coerce.number().int().min(0).max(365),
  // Unchecked checkboxes are not sent at all, so "missing" means false.
  isPaid: z.string().optional().transform((value) => value === "on"),
  requiresAttachment: z.string().optional().transform((value) => value === "on"),
});

export const leaveDecisionSchema = z.object({
  leaveRequestId: requiredText,
  decisionNote: optionalText,
});
