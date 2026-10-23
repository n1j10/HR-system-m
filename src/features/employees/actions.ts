"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { formDataToObject } from "@/lib/validation";
import { errorResult, validationErrorResult, type ActionResult } from "@/lib/action-result";
import { employeeSchema } from "@/features/employees/schemas";

/** EMP-0001, EMP-0002, ... Archived employees are counted too, so numbers are never reused. */
async function generateEmployeeNumber() {
  const totalEmployees = await prisma.employee.count();
  return `EMP-${String(totalEmployees + 1).padStart(4, "0")}`;
}

export async function createEmployee(_previousResult: ActionResult, formData: FormData): Promise<ActionResult> {
  const currentUser = await requirePermission("employee:manage");

  const parsed = employeeSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return validationErrorResult(parsed.error);

  const emailIsTaken = await prisma.employee.findUnique({ where: { email: parsed.data.email } });
  if (emailIsTaken) return errorResult("Another employee already uses this email");

  // If this person already signed in once, connect their account now.
  const existingUser = await prisma.user.findUnique({ where: { email: parsed.data.email }, include: { employee: true } });
  const userToLink = existingUser && !existingUser.employee ? existingUser : null;

  const employee = await prisma.employee.create({
    data: {
      ...parsed.data,
      employeeNumber: await generateEmployeeNumber(),
      userId: userToLink?.id,
    },
  });

  await createAuditLog({
    userId: currentUser.id,
    action: "CREATE",
    entity: "Employee",
    entityId: employee.id,
    details: { employeeNumber: employee.employeeNumber, name: `${employee.firstName} ${employee.lastName}` },
  });

  revalidatePath("/employees");
  redirect(`/employees/${employee.id}`);
}

export async function updateEmployee(_previousResult: ActionResult, formData: FormData): Promise<ActionResult> {
  const currentUser = await requirePermission("employee:manage");
  const employeeId = String(formData.get("employeeId"));

  const parsed = employeeSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return validationErrorResult(parsed.error);

  if (parsed.data.managerId === employeeId) return errorResult("An employee cannot be their own manager");

  const employeeWithSameEmail = await prisma.employee.findUnique({ where: { email: parsed.data.email } });
  if (employeeWithSameEmail && employeeWithSameEmail.id !== employeeId) {
    return errorResult("Another employee already uses this email");
  }

  const employeeBefore = await prisma.employee.findUniqueOrThrow({ where: { id: employeeId } });
  await prisma.employee.update({ where: { id: employeeId }, data: parsed.data });

  // Keep the old and new values of fields people usually care about.
  await createAuditLog({
    userId: currentUser.id,
    action: "UPDATE",
    entity: "Employee",
    entityId: employeeId,
    details: {
      before: {
        status: employeeBefore.status,
        departmentId: employeeBefore.departmentId,
        positionId: employeeBefore.positionId,
        baseSalary: employeeBefore.baseSalary.toString(),
      },
      after: {
        status: parsed.data.status,
        departmentId: parsed.data.departmentId,
        positionId: parsed.data.positionId,
        baseSalary: String(parsed.data.baseSalary),
      },
    },
  });

  revalidatePath("/employees");
  revalidatePath(`/employees/${employeeId}`);
  redirect(`/employees/${employeeId}`);
}

/** Soft delete: the employee is hidden but their history stays in the database. */
export async function archiveEmployee(_previousResult: ActionResult, formData: FormData): Promise<ActionResult> {
  const currentUser = await requirePermission("employee:manage");
  const employeeId = String(formData.get("employeeId"));

  const reportCount = await prisma.employee.count({ where: { managerId: employeeId, deletedAt: null } });
  if (reportCount > 0) return errorResult("This employee manages other people. Assign them a new manager first.");

  await prisma.employee.update({ where: { id: employeeId }, data: { deletedAt: new Date() } });

  await createAuditLog({ userId: currentUser.id, action: "ARCHIVE", entity: "Employee", entityId: employeeId });
  revalidatePath("/employees");
  redirect("/employees");
}
