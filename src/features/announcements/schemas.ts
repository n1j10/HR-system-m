import { z } from "zod";

import { requiredText } from "@/lib/validation";

export const announcementSchema = z.object({
  title: requiredText.max(150),
  body: requiredText,
});
