"use server";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { formDataToObject } from "@/lib/validation";
import { errorResult, successResult, validationErrorResult, type ActionResult } from "@/lib/action-result";
import { assetConditionSchema, assetSchema, assignAssetSchema } from "@/features/assets/schemas";

export async function createAsset(_previousResult: ActionResult, formData: FormData): Promise<ActionResult> {
  const currentUser = await requirePermission("asset:manage");

  const parsed = assetSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return validationErrorResult(parsed.error);

  if (parsed.data.serialNumber) {
    const serialIsTaken = await prisma.asset.findUnique({ where: { serialNumber: parsed.data.serialNumber } });
    if (serialIsTaken) return errorResult("Another asset already has this serial number");
  }

  const asset = await prisma.asset.create({ data: parsed.data });

  await createAuditLog({ userId: currentUser.id, action: "CREATE", entity: "Asset", entityId: asset.id, details: { name: asset.name } });
  revalidatePath("/assets");
  return successResult("Asset added");
}

export async function assignAsset(_previousResult: ActionResult, formData: FormData): Promise<ActionResult> {
  const currentUser = await requirePermission("asset:manage");

  const parsed = assignAssetSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return validationErrorResult(parsed.error);

  const asset = await prisma.asset.findUnique({ where: { id: parsed.data.assetId } });
  if (!asset) return errorResult("Asset not found");
  if (asset.assignedEmployeeId) return errorResult("This asset is already with someone. Return it first.");

  await prisma.asset.update({
    where: { id: asset.id },
    data: { assignedEmployeeId: parsed.data.employeeId, assignedAt: new Date() },
  });

  await createAuditLog({ userId: currentUser.id, action: "ASSIGN", entity: "Asset", entityId: asset.id, details: { employeeId: parsed.data.employeeId } });
  revalidatePath("/assets");
  return successResult("Asset handed over");
}

export async function returnAsset(_previousResult: ActionResult, formData: FormData): Promise<ActionResult> {
  const currentUser = await requirePermission("asset:manage");
  const assetId = String(formData.get("assetId"));

  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset?.assignedEmployeeId) return errorResult("This asset is not assigned to anyone");

  await prisma.asset.update({ where: { id: assetId }, data: { assignedEmployeeId: null, assignedAt: null } });

  // The audit log keeps the history of who had the asset.
  await createAuditLog({ userId: currentUser.id, action: "RETURN", entity: "Asset", entityId: assetId, details: { returnedBy: asset.assignedEmployeeId } });
  revalidatePath("/assets");
  return successResult("Asset returned");
}

export async function changeAssetCondition(_previousResult: ActionResult, formData: FormData): Promise<ActionResult> {
  const currentUser = await requirePermission("asset:manage");

  const parsed = assetConditionSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return validationErrorResult(parsed.error);

  await prisma.asset.update({ where: { id: parsed.data.assetId }, data: { condition: parsed.data.condition } });

  await createAuditLog({ userId: currentUser.id, action: "UPDATE", entity: "Asset", entityId: parsed.data.assetId, details: { condition: parsed.data.condition } });
  revalidatePath("/assets");
  return successResult("Condition updated");
}
