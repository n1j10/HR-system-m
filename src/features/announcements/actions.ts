"use server";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { formDataToObject } from "@/lib/validation";
import { successResult, validationErrorResult, type ActionResult } from "@/lib/action-result";
import { announcementSchema } from "@/features/announcements/schemas";

export async function createAnnouncement(_previousResult: ActionResult, formData: FormData): Promise<ActionResult> {
  const currentUser = await requirePermission("announcement:manage");

  const parsed = announcementSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return validationErrorResult(parsed.error);

  const announcement = await prisma.announcement.create({ data: { ...parsed.data, createdById: currentUser.id } });

  await createAuditLog({ userId: currentUser.id, action: "CREATE", entity: "Announcement", entityId: announcement.id, details: { title: announcement.title } });
  revalidatePath("/announcements");
  revalidatePath("/dashboard");
  return successResult("Announcement published");
}

export async function deleteAnnouncement(_previousResult: ActionResult, formData: FormData): Promise<ActionResult> {
  const currentUser = await requirePermission("announcement:manage");
  const announcementId = String(formData.get("announcementId"));

  await prisma.announcement.delete({ where: { id: announcementId } });

  await createAuditLog({ userId: currentUser.id, action: "DELETE", entity: "Announcement", entityId: announcementId });
  revalidatePath("/announcements");
  revalidatePath("/dashboard");
  return successResult("Announcement deleted");
}
