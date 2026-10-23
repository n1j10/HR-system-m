"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { formDataToObject } from "@/lib/validation";
import { errorResult, successResult, validationErrorResult, type ActionResult } from "@/lib/action-result";
import { departmentSchema } from "@/features/departments/schemas";

export async function createDepartment(_previousResult: ActionResult, formData: FormData): Promise<ActionResult> {
  const currentUser = await requirePermission("organization:manage");

  const parsed = departmentSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return validationErrorResult(parsed.error);

  const codeIsTaken = await prisma.department.findUnique({ where: { code: parsed.data.code } });
  if (codeIsTaken) return errorResult("Another department already uses this code");

  const department = await prisma.department.create({ data: parsed.data });

  await createAuditLog({ userId: currentUser.id, action: "CREATE", entity: "Department", entityId: department.id, details: parsed.data });
  revalidatePath("/departments");
  return successResult("Department created");
}

export async function updateDepartment(_previousResult: ActionResult, formData: FormData): Promise<ActionResult> {
  const currentUser = await requirePermission("organization:manage");
  const departmentId = String(formData.get("departmentId"));

  const parsed = departmentSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return validationErrorResult(parsed.error);

  const departmentWithSameCode = await prisma.department.findUnique({ where: { code: parsed.data.code } });
  if (departmentWithSameCode && departmentWithSameCode.id !== departmentId) {
    return errorResult("Another department already uses this code");
  }

  await prisma.department.update({ where: { id: departmentId }, data: parsed.data });

  await createAuditLog({ userId: currentUser.id, action: "UPDATE", entity: "Department", entityId: departmentId, details: parsed.data });
  revalidatePath("/departments");
  redirect("/departments");
}

export async function deleteDepartment(_previousResult: ActionResult, formData: FormData): Promise<ActionResult> {
  const currentUser = await requirePermission("organization:manage");
  const departmentId = String(formData.get("departmentId"));

  const employeeCount = await prisma.employee.count({ where: { departmentId } });
  if (employeeCount > 0) return errorResult("Move the employees to another department first");

  await prisma.department.delete({ where: { id: departmentId } });

  await createAuditLog({ userId: currentUser.id, action: "DELETE", entity: "Department", entityId: departmentId });
  revalidatePath("/departments");
  return successResult("Department deleted");
}
