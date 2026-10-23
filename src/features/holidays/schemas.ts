import { z } from "zod";

import { requiredDate, requiredText } from "@/lib/validation";

export const holidaySchema = z.object({
  name: requiredText,
  date: requiredDate,
});
