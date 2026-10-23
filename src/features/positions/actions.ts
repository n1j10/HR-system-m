"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { formDataToObject } from "@/lib/validation";
import { errorResult, successResult, validationErrorResult, type ActionResult } from "@/lib/action-result";
import { positionSchema } from "@/features/positions/schemas";

export async function createPosition(_previousResult: ActionResult, formData: FormData): Promise<ActionResult> {
  const currentUser = await requirePermission("organization:manage");

  const parsed = positionSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return validationErrorResult(parsed.error);

  const titleIsTaken = await prisma.position.findUnique({ where: { title: parsed.data.title } });
  if (titleIsTaken) return errorResult("A position with this title already exists");

  const position = await prisma.position.create({ data: parsed.data });

  await createAuditLog({ userId: currentUser.id, action: "CREATE", entity: "Position", entityId: position.id, details: parsed.data });
  revalidatePath("/positions");
  return successResult("Position created");
}

export async function updatePosition(_previousResult: ActionResult, formData: FormData): Promise<ActionResult> {
  const currentUser = await requirePermission("organization:manage");
  const positionId = String(formData.get("positionId"));

  const parsed = positionSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return validationErrorResult(parsed.error);

  const positionWithSameTitle = await prisma.position.findUnique({ where: { title: parsed.data.title } });
  if (positionWithSameTitle && positionWithSameTitle.id !== positionId) {
    return errorResult("A position with this title already exists");
  }

  await prisma.position.update({ where: { id: positionId }, data: parsed.data });

  await createAuditLog({ userId: currentUser.id, action: "UPDATE", entity: "Position", entityId: positionId, details: parsed.data });
  revalidatePath("/positions");
  redirect("/positions");
}

export async function deletePosition(_previousResult: ActionResult, formData: FormData): Promise<ActionResult> {
  const currentUser = await requirePermission("organization:manage");
  const positionId = String(formData.get("positionId"));

  const employeeCount = await prisma.employee.count({ where: { positionId } });
  if (employeeCount > 0) return errorResult("Some employees still have this position");

  await prisma.position.delete({ where: { id: positionId } });

  await createAuditLog({ userId: currentUser.id, action: "DELETE", entity: "Position", entityId: positionId });
  revalidatePath("/positions");
  return successResult("Position deleted");
}
