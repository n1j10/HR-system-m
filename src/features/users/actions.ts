"use server";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { formDataToObject } from "@/lib/validation";
import { errorResult, successResult, validationErrorResult, type ActionResult } from "@/lib/action-result";
import { userAccessSchema } from "@/features/users/schemas";

/** Changes a user's role, linked employee and active status. */
export async function updateUserAccess(_previousResult: ActionResult, formData: FormData): Promise<ActionResult> {
  const currentUser = await requirePermission("user:manage");

  const parsed = userAccessSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return validationErrorResult(parsed.error);
  const { userId, role, employeeId, isActive } = parsed.data;

  // Stop admins from locking themselves out by mistake.
  if (userId === currentUser.id && (role !== "SUPER_ADMIN" || !isActive)) {
    return errorResult("You cannot remove your own Super Admin access");
  }

  if (employeeId) {
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (employee?.userId && employee.userId !== userId) return errorResult("This employee is linked to another account");
  }

  await prisma.$transaction([
    // First unlink whatever employee this user had, then link the chosen one.
    prisma.employee.updateMany({ where: { userId }, data: { userId: null } }),
    ...(employeeId ? [prisma.employee.update({ where: { id: employeeId }, data: { userId } })] : []),
    prisma.user.update({ where: { id: userId }, data: { role, isActive } }),
  ]);

  await createAuditLog({ userId: currentUser.id, action: "UPDATE_ACCESS", entity: "User", entityId: userId, details: { role, employeeId, isActive } });
  revalidatePath("/settings/users");
  return successResult("User updated");
}
