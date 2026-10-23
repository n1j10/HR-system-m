import { z } from "zod";

import { CandidateStage, JobStatus } from "@prisma/client";
import { optionalText, requiredText } from "@/lib/validation";

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
  phone: optionalText,
  resumeUrl: z.url("Resume must be a link, e.g. Google Drive or LinkedIn"),
  coverLetter: optionalText,
});

export const candidateStageSchema = z.object({
  candidateId: requiredText,
  stage: z.enum(CandidateStage),
  notes: optionalText,
});
