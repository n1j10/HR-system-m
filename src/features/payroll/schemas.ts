import { z } from "zod";

import { moneyAmount, requiredText } from "@/lib/validation";

export const payrollRunSchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
});

export const payslipAdjustmentSchema = z.object({
  payslipId: requiredText,
  bonus: moneyAmount,
  otherDeductions: moneyAmount,
});
