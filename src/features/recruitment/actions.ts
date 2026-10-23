"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { formDataToObject } from "@/lib/validation";
import { errorResult, successResult, validationErrorResult, type ActionResult } from "@/lib/action-result";
import { candidateStageSchema, jobApplicationSchema, jobPostingSchema, jobStatusSchema } from "@/features/recruitment/schemas";

export async function createJobPosting(_previousResult: ActionResult, formData: FormData): Promise<ActionResult> {
  const currentUser = await requirePermission("recruitment:manage");

  const parsed = jobPostingSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return validationErrorResult(parsed.error);

  const jobPosting = await prisma.jobPosting.create({ data: parsed.data });

  await createAuditLog({ userId: currentUser.id, action: "CREATE", entity: "JobPosting", entityId: jobPosting.id, details: { title: jobPosting.title } });
  revalidatePath("/recruitment");
  redirect(`/recruitment/${jobPosting.id}`);
}

export async function changeJobStatus(_previousResult: ActionResult, formData: FormData): Promise<ActionResult> {
  const currentUser = await requirePermission("recruitment:manage");

  const parsed = jobStatusSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return validationErrorResult(parsed.error);

  await prisma.jobPosting.update({ where: { id: parsed.data.jobPostingId }, data: { status: parsed.data.status } });

  await createAuditLog({ userId: currentUser.id, action: "UPDATE", entity: "JobPosting", entityId: parsed.data.jobPostingId, details: { status: parsed.data.status } });
  revalidatePath("/recruitment");
  revalidatePath(`/recruitment/${parsed.data.jobPostingId}`);
  return successResult(parsed.data.status === "OPEN" ? "Job is open for applications" : "Job closed");
}

export async function moveCandidateToStage(_previousResult: ActionResult, formData: FormData): Promise<ActionResult> {
  const currentUser = await requirePermission("recruitment:manage");

  const parsed = candidateStageSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return validationErrorResult(parsed.error);

  const candidate = await prisma.candidate.update({
    where: { id: parsed.data.candidateId },
    data: { stage: parsed.data.stage, notes: parsed.data.notes },
  });

  await createAuditLog({ userId: currentUser.id, action: "MOVE_STAGE", entity: "Candidate", entityId: candidate.id, details: { stage: candidate.stage } });
  revalidatePath(`/recruitment/${candidate.jobPostingId}`);
  return successResult(`${candidate.fullName} moved to ${candidate.stage.toLowerCase()}`);
}

/** Public action: no sign-in needed. Used by the careers page. */
export async function applyForJob(_previousResult: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = jobApplicationSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return validationErrorResult(parsed.error);

  const jobPosting = await prisma.jobPosting.findFirst({ where: { id: parsed.data.jobPostingId, status: "OPEN" } });
  if (!jobPosting) return errorResult("This job is no longer open");

  const email = parsed.data.email.toLowerCase();
  const alreadyApplied = await prisma.candidate.findFirst({ where: { jobPostingId: jobPosting.id, email } });
  if (alreadyApplied) return errorResult("You have already applied for this job");

  await prisma.candidate.create({ data: { ...parsed.data, email } });

  revalidatePath(`/recruitment/${jobPosting.id}`);
  return successResult("Thank you! Your application was sent.");
}
