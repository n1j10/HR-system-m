"use server";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { formDataToObject } from "@/lib/validation";
import { errorResult, successResult, validationErrorResult, type ActionResult } from "@/lib/action-result";
import { holidaySchema } from "@/features/holidays/schemas";

export async function createHoliday(_previousResult: ActionResult, formData: FormData): Promise<ActionResult> {
  const currentUser = await requirePermission("holiday:manage");

  const parsed = holidaySchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return validationErrorResult(parsed.error);

  const dateIsTaken = await prisma.holiday.findUnique({ where: { date: parsed.data.date } });
  if (dateIsTaken) return errorResult(`This date is already a holiday (${dateIsTaken.name})`);

  const holiday = await prisma.holiday.create({ data: parsed.data });

  await createAuditLog({ userId: currentUser.id, action: "CREATE", entity: "Holiday", entityId: holiday.id, details: { name: holiday.name } });
  revalidatePath("/holidays");
  return successResult("Holiday added");
}

export async function deleteHoliday(_previousResult: ActionResult, formData: FormData): Promise<ActionResult> {
  const currentUser = await requirePermission("holiday:manage");
  const holidayId = String(formData.get("holidayId"));

  await prisma.holiday.delete({ where: { id: holidayId } });

  await createAuditLog({ userId: currentUser.id, action: "DELETE", entity: "Holiday", entityId: holidayId });
  revalidatePath("/holidays");
  return successResult("Holiday deleted");
}
