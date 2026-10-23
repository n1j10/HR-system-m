"use server";

import { revalidatePath } from "next/cache";
import type { GoalStatus } from "@prisma/client";

import { getCurrentUser, requirePermission, type CurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { hasPermission } from "@/lib/permissions";
import { formDataToObject } from "@/lib/validation";
import { errorResult, successResult, validationErrorResult, type ActionResult } from "@/lib/action-result";
import { canViewEmployee } from "@/features/employees/queries";
import { goalProgressSchema, goalSchema, performanceReviewSchema } from "@/features/performance/schemas";

function getGoalStatusFromProgress(progress: number): GoalStatus {
  if (progress === 0) return "NOT_STARTED";
  if (progress === 100) return "COMPLETED";
  return "IN_PROGRESS";
}

/** Managers can only set goals and reviews for their own team. */
async function canManagePerformanceOf(user: CurrentUser, employeeId: string) {
  // Nobody sets goals for or reviews themselves.
  if (employeeId === user.employee?.id) return false;

  const employee = await prisma.employee.findFirst({ where: { id: employeeId, deletedAt: null } });
  if (!employee) return false;

  return canViewEmployee(user, employee);
}

export async function createGoal(_previousResult: ActionResult, formData: FormData): Promise<ActionResult> {
  const currentUser = await requirePermission("performance:manage");

  const parsed = goalSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return validationErrorResult(parsed.error);

  if (!(await canManagePerformanceOf(currentUser, parsed.data.employeeId))) {
    return errorResult("You can only set goals for your own team");
  }

  const goal = await prisma.goal.create({ data: parsed.data });

  await createAuditLog({ userId: currentUser.id, action: "CREATE", entity: "Goal", entityId: goal.id, details: { title: goal.title } });
  revalidatePath("/performance");
  return successResult("Goal added");
}

/** The employee updates their own goal. Their manager or HR can update it too. */
export async function updateGoalProgress(_previousResult: ActionResult, formData: FormData): Promise<ActionResult> {
  const currentUser = await getCurrentUser();

  const parsed = goalProgressSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return validationErrorResult(parsed.error);

  const goal = await prisma.goal.findUnique({ where: { id: parsed.data.goalId } });
  if (!goal) return errorResult("Goal not found");

  const isOwnGoal = goal.employeeId === currentUser.employee?.id;
  const isGoalOfMyTeam =
    hasPermission(currentUser.role, "performance:manage") && (await canManagePerformanceOf(currentUser, goal.employeeId));
  if (!isOwnGoal && !isGoalOfMyTeam) return errorResult("You cannot update this goal");

  const { progress } = parsed.data;
  await prisma.goal.update({ where: { id: goal.id }, data: { progress, status: getGoalStatusFromProgress(progress) } });

  revalidatePath("/performance");
  return successResult(`Progress saved: ${progress}%`);
}

export async function createPerformanceReview(_previousResult: ActionResult, formData: FormData): Promise<ActionResult> {
  const currentUser = await requirePermission("performance:manage");

  const parsed = performanceReviewSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return validationErrorResult(parsed.error);

  if (!(await canManagePerformanceOf(currentUser, parsed.data.employeeId))) {
    return errorResult("You can only review your own team");
  }

  const review = await prisma.performanceReview.create({ data: { ...parsed.data, reviewerId: currentUser.id } });

  await createAuditLog({ userId: currentUser.id, action: "CREATE", entity: "PerformanceReview", entityId: review.id, details: { rating: review.rating } });
  revalidatePath("/performance");
  return successResult("Review saved");
}
