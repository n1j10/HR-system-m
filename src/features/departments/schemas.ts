import { z } from "zod";

import { optionalText, requiredText } from "@/lib/validation";

export const departmentSchema = z.object({
  name: requiredText,
  code: requiredText.transform((code) => code.toUpperCase()),
  description: optionalText,
});
