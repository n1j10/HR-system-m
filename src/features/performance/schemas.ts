import { z } from "zod";

import { optionalDate, optionalText, requiredText } from "@/lib/validation";

export const goalSchema = z.object({
  employeeId: requiredText,
  title: requiredText,
  description: optionalText,
  dueDate: optionalDate,
});

export const goalProgressSchema = z.object({
  goalId: requiredText,
  progress: z.coerce.number().int().min(0).max(100),
});

export const performanceReviewSchema = z.object({
  employeeId: requiredText,
  period: requiredText, // e.g. "2026 H1" or "Q3 2026"
  rating: z.coerce.number().int().min(1, "Rating is from 1 to 5").max(5, "Rating is from 1 to 5"),
  comments: optionalText,
});
