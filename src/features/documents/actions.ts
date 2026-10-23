"use server";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { formDataToObject } from "@/lib/validation";
import { successResult, validationErrorResult, type ActionResult } from "@/lib/action-result";
import { documentSchema } from "@/features/documents/schemas";

export async function createDocument(_previousResult: ActionResult, formData: FormData): Promise<ActionResult> {
  const currentUser = await requirePermission("document:manage");

  const parsed = documentSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return validationErrorResult(parsed.error);

  const document = await prisma.document.create({ data: parsed.data });

  await createAuditLog({ userId: currentUser.id, action: "CREATE", entity: "Document", entityId: document.id, details: { title: document.title, employeeId: document.employeeId } });
  revalidatePath("/documents");
  return successResult("Document added");
}

export async function deleteDocument(_previousResult: ActionResult, formData: FormData): Promise<ActionResult> {
  const currentUser = await requirePermission("document:manage");
  const documentId = String(formData.get("documentId"));

  await prisma.document.delete({ where: { id: documentId } });

  await createAuditLog({ userId: currentUser.id, action: "DELETE", entity: "Document", entityId: documentId });
  revalidatePath("/documents");
  return successResult("Document deleted");
}
