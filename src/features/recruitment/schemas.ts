import { z } from "zod";

import { CandidateStage, JobStatus } from "@prisma/client";
import { httpUrl, optionalText, requiredText } from "@/lib/validation";

export const jobPostingSchema = z.object({
  title: requiredText,
  description: requiredText,
  location: optionalText,
});

export const jobStatusSchema = z.object({
  jobPostingId: requiredText,
  status: z.enum(JobStatus),
});

/** Filled by people applying from the public careers page. */
export const jobApplicationSchema = z.object({
  jobPostingId: requiredText,
  fullName: requiredText.max(100),
  email: z.email("Enter a valid email"),
  // Public endpoint: every field is length-bounded to prevent storage abuse.
  phone: z.string().trim().max(30).optional().transform((value) => value || null),
  resumeUrl: httpUrl("Resume must be a link, e.g. Google Drive or LinkedIn").max(500),
  coverLetter: z.string().trim().max(5000).optional().transform((value) => value || null),
});

export const candidateStageSchema = z.object({
  candidateId: requiredText,
  stage: z.enum(CandidateStage),
  notes: optionalText,
});
