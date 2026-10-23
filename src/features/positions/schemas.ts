import { z } from "zod";

import { optionalText, optionalWholeNumber, requiredText } from "@/lib/validation";

export const positionSchema = z.object({
  title: requiredText,
  level: optionalWholeNumber(1, 20),
  description: optionalText,
});
