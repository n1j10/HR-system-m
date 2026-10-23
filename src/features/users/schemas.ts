import { z } from "zod";

import { Role } from "@prisma/client";
import { optionalId, requiredText } from "@/lib/validation";

export const userAccessSchema = z.object({
  userId: requiredText,
  role: z.enum(Role),
  employeeId: optionalId,
  // Unchecked checkboxes are not sent, so "missing" means the account is disabled.
  isActive: z.string().optional().transform((value) => value === "on"),
});
