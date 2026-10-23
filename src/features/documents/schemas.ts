import { z } from "zod";

import { optionalDate, requiredText } from "@/lib/validation";

export const DOCUMENT_CATEGORIES = ["National ID", "Passport", "Residency", "Contract", "Certificate", "Driving licence", "Other"];

export const documentSchema = z.object({
  employeeId: requiredText,
  title: requiredText,
  category: z.enum(DOCUMENT_CATEGORIES),
  fileUrl: z.url("File must be a link"),
  expiresAt: optionalDate,
});
